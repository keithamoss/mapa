#!/bin/bash

postgres_ready()
{
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME", user="$DB_USERNAME", password="$DB_PASSWORD", host="$DB_HOST")
except psycopg2.OperationalError as e:
    print(e)
    sys.exit(-1)
sys.exit(0)
END
}

waitfordb()
{
  until postgres_ready; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done

  >&2 echo "Postgres is up - continuing..."

  sleep 4
}

CMD="$1"

# AWS Lambda App entrypoint (production)
if [ "$CMD" = "lambda_gunicorn" ]; then
  >&2 echo "Serving Lambda request via gunicorn"

  gunicorn mapa.wsgi:application -c=gunicorn.conf.py
  exit
fi

# AWS Lambda Cron entrypoint (production)
if [ "$CMD" = "lambda_cron" ]; then
  >&2 echo "Initiating Lambda cron job"

  python /app/mapa/app/cron/cron.py
  exit
fi

# Cron entrypoint for DigitalOcean and local dev (development and production)
if [ "$CMD" != "build" -a "$CMD" != "lambda_cron" ]; then
  waitfordb

  >&2 echo "Starting crond in the background"
  # Print environment variables for cron to utilise
  # Source: https://stackoverflow.com/a/48651061
  declare -p | grep -Ev 'BASH|BASHOPTS|BASH_VERSINFO|BASHPID|BASH_|EUID|PPID|SHELLOPTS|UID' > /app/mapa/app/cron/mapa.cron.env

  # Add our cronjob
  cat /app/mapa/app/cron/crontab.txt >> mapa_cron
  crontab mapa_cron
  rm mapa_cron

  # Ensure we have a place to log to
  mkdir -p /app/logs/cron

  # Start crond service
  chmod 755 /app/mapa/app/cron/cron.sh
  service cron start
fi

# Supervisord entrypoint (production)
if [ "$CMD" = "supervisord" ]; then
  waitfordb

  export ENVIRONMENT=PRODUCTION
  django-admin migrate

  /usr/bin/supervisord -c /app/supervisord.conf
  exit
fi

# Build entrypoint (development)
if [ "$CMD" = "build" ]; then
  rm -rf /app/static
  mkdir -p /app/static
  
  django-admin collectstatic --noinput

  cd /app/static && tar czvf /build/django.tgz .
  exit
fi

# Development server (development)
if [ "$ENVIRONMENT" = "DEVELOPMENT" ]; then
  waitfordb

  django-admin migrate
  django-admin runserver "0.0.0.0:8000"
  exit
fi

# Not sure this actually does...anything
# exec "$@"