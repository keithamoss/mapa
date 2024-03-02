"""gunicorn WSGI server configuration."""
from multiprocessing import cpu_count
from os import environ


def max_workers():
    return 1 if environ.get("AWS_LAMBDA_DEPLOYMENT") == "TRUE" else (2 * cpu_count()) + 1


bind = "0.0.0.0:" + environ.get("PORT", "8000")
max_requests = 1000
max_requests_jitter = 30
worker_class = "gevent"
workers = max_workers()
forwarded_allow_ips = "*"
loglevel = "info"
# pythonpath = "/env/lib/python3.11/site-packages"
timeout = 30
