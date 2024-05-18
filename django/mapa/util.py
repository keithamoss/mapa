import datetime
import functools
import json
import logging
import os
import string
import sys
import threading
import time
import traceback
import unicodedata
from urllib.parse import quote

import pytz
from aws_lambda_powertools.utilities import parameters

# For some reason this was causing that weird Google complete login SSL session context infinite redirect error
# that was itself due to a gevent MonkeyPatchWarning:
# /usr/local/lib/python3.11/site-packages/gunicorn/workers/ggevent.py:39: MonkeyPatchWarning: 
# Monkey-patching ssl after ssl has already been imported may lead to errors, including RecursionError on Python 3.6. It may also silently lead to incorrect behaviour on Python 3.7. Please monkey-patch earlier. See https://github.com/gevent/gevent/issues/1016. Modules that had direct imports (NOT patched): ['urllib3.util.ssl_ (/usr/local/lib/python3.11/site-packages/urllib3/util/ssl_.py)', 'botocore.httpsession (/usr/local/lib/python3.11/site-packages/botocore/httpsession.py)', 'urllib3.util (/usr/local/lib/python3.11/site-packages/urllib3/util/__init__.py)']
# We fixed it in this case by removing our get_env() utility function and using os.environ.get() directly (the functionality was the same anyway, so not sure why we even had a utility function!)
from django.conf import settings

# Doesn't actually seem to be needed in DEV, and in PROD we have aws_lambda_powertools.Logger
# def make_logger(name, handler=logging.StreamHandler(), formatter=None):
#     logger = logging.getLogger(name)
#     logger.setLevel(logging.DEBUG)
#     # handler = logging.StreamHandler()
#     if formatter is None:
#         fmt = logging.Formatter("%(asctime)s [%(levelname)s] [P:%(process)d] [%(threadName)s] %(message)s (%(pathname)s %(funcName)s() line=%(lineno)d)")
#     else:
#         fmt = formatter
#     handler.setFormatter(fmt)
#     logger.addHandler(handler)
#     return logger


class LogLevelFilter(object):
    def __init__(self, level):
        self.level = level

    def filter(self, record):
        return record.levelno != self.level


def deepupdate(original, update):
    """
    Recursively update a dict.
    Subdict's won't be overwritten but also updated.
    http://stackoverflow.com/a/8310229/7368493
    """
    for key, value in original.items():
        if key not in update:
            update[key] = value
        elif isinstance(value, dict):
            deepupdate(value, update[key])
    return update


def timeit(method):
    def timed(*args, **kw):
        ts = time.time()
        result = method(*args, **kw)
        te = time.time()
        if 'log_time' in kw:
            name = kw.get('log_name', method.__name__.upper())
            kw['log_time'][name] = int((te - ts) * 1000)
        else:
            print('%r  %2.2f ms' %
                  (method.__name__, (te - ts) * 1000))
        return result
    return timed


def is_one_of_these_things_in_this_other_thing(a, b):
    return not set(a).isdisjoint(b)


def get_or_none(classmodel, **kwargs):
    try:
        return classmodel.objects.get(**kwargs)
    except classmodel.DoesNotExist:
        return None


def add_datetime_to_filename(filename):
    filename, file_extension = os.path.splitext(filename)
    datetime_str = datetime.datetime.now(pytz.timezone(settings.TIME_ZONE)).replace(microsecond=0).replace(tzinfo=None).isoformat()
    return clean_filename("{filename}_{datetime}.{ext}".format(filename=filename, datetime=datetime_str, ext=file_extension[1:]))


def clean_filename(filename, whitelist=None, replace=" "):
    """
    https://gist.github.com/wassname/1393c4a57cfcbf03641dbc31886123b8
    """
    if whitelist is None:
        whitelist = "-_.() %s%s" % (string.ascii_letters, string.digits)
    char_limit = 255

    # replace spaces
    for r in replace:
        filename = filename.replace(r, '_')

    # keep only valid ascii chars
    cleaned_filename = unicodedata.normalize('NFKD', filename).encode('ASCII', 'ignore').decode()

    # keep only whitelisted chars
    cleaned_filename = ''.join(c for c in cleaned_filename if c in whitelist)
    if len(cleaned_filename) > char_limit:
        print("Warning, filename truncated because it was over {}. Filenames may no longer be unique".format(char_limit))

    return cleaned_filename[:char_limit]


def is_float(string):
    """
    Here be dragons.
    https://stackoverflow.com/a/20929983
    """
    try:
        float(string)
        return True
    except ValueError:
        return False


def is_int(string):
    """
    Here be dragons.
    https://stackoverflow.com/a/20929983
    """
    try:
        int(string)
        return True
    except ValueError:
        return False


def is_numeric(subject):
    return is_float(subject) is True or is_int(subject) is True


def convert_string_to_number(subject):
    if is_int(subject) is True:
        return int(subject)
    elif is_float(subject) is True:
        return float(subject)
    else:
        raise Exception("Failed try to convert '{}' to a number".format(subject))


def merge_and_sum_dicts(dict_list):
    merged_dict = {}

    for d in dict_list:
        for key, value in d.items():
            if key not in merged_dict:
                if value is None or isinstance(value, bool):
                    merged_dict[key] = value
                elif is_numeric(value) is True:
                    merged_dict[key] = convert_string_to_number(value)
                elif isinstance(value, str):
                    merged_dict[key] = [value]
                else:
                    print("{} is {}".format(key, type(key)))
                    merged_dict[key] = value

            else:
                if value is None or isinstance(value, bool):
                    merged_dict[key] = value
                elif is_numeric(value) is True:
                    merged_dict[key] = merged_dict[key] + convert_string_to_number(value)
                elif isinstance(value, str):
                    merged_dict[key].append(value)
                else:
                    merged_dict[key] = value

    # Concatenate any lists of strings together
    for key, value in merged_dict.items():
        if isinstance(value, list):
            merged_dict[key] = ", ".join(merged_dict[key])

    return merged_dict


def get_url_safe_election_name(election):
    return quote(election.name.lower().replace(" ", "_"))


def threaded(func):
    """Decorator to automatically launch a function in a thread"""
    # Ref: https://stackoverflow.com/a/67071996
    @functools.wraps(func)
    def wrapper(*args, **kwargs):  # replaces original function...
        # ...and launches the original in a thread
        thread = threading.Thread(target=func, args=args, kwargs=kwargs)
        thread.start()
        return thread
    return wrapper


def is_jsonable(obj):
    try:
        json.dumps(obj)
        return True
    except:
        return False


def is_iterable(obj):
    # https://stackoverflow.com/a/1952655

    try:
        iterator = iter(obj)
    except TypeError:
        # not iterable
        return False
    else:
        # iterable
        return True


def get_stracktrace_string_for_current_exception():
    # https://stackoverflow.com/a/49613561

    # Get current system exception
    ex_type, ex_value, ex_traceback = sys.exc_info()

    # Extract unformatter stack traces as tuples
    trace_back = traceback.extract_tb(ex_traceback)

    # Format stacktrace
    stack_trace = list()

    for trace in trace_back:
        stack_trace.append("File \"%s\", line : %d, in \"%s\", message: %s" % (trace[0], trace[1], trace[2], trace[3]))

    return "\r\n".join(stack_trace)

def get_secret_from_ssm_or_local_env_var(secret_name):
    try :
        secrets = parameters.get_secret(os.environ.get("AWS_SECRETS_NAME"), transform="json")
        return secrets[secret_name]
    except Exception:
        # For local dev and the old-school "Run it on a Droplet/EC2" deployment scenario
        return os.environ.get(secret_name)