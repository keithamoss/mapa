"""gunicorn WSGI server configuration."""
from multiprocessing import cpu_count
from os import environ

from mapa.app.envs import is_running_in_aws_lambda


def max_workers():
    return 1 if is_running_in_aws_lambda() is True else (2 * cpu_count()) + 1


bind = "0.0.0.0:" + environ.get("PORT", "8000")
max_requests = 1000
max_requests_jitter = 30
worker_class = "gevent"
workers = max_workers()
forwarded_allow_ips = "*"
loglevel = "info"
# pythonpath = "/env/lib/python3.11/site-packages"
timeout = 30
