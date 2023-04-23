#!/bin/bash

postgres_ready()
{
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME", user="$DB_USERNAME", password="$DB_PASSWORD", host="$DB_HOST")
except psycopg2.OperationalError:
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

exec "$@"