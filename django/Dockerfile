FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

# Poetry config
## Make poetry install to this location
ENV POETRY_HOME="/opt/poetry"
## Prevent poetry from creating a virtual environment
ENV POETRY_VIRTUALENVS_CREATE=false
## Do not ask any interactive questions
ENV POETRY_NO_INTERACTION=1
## Prepend poetry to path
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN apt-get update && apt-get -y upgrade
# Only needed in the old-school "Run it on a Droplet/EC2" deployment scenario
# RUN apt-get install -y supervisor

# Poetry for Python deps management
RUN apt-get install -y curl
RUN curl -sSL https://install.python-poetry.org | python -

# Even though Dependabot takes care of updating packages for us, we still need this for poetry to install without complaining about some packages "not being available at [version]". Whatever!
ADD ./pyproject.toml /app/pyproject.toml
ADD ./poetry.lock /app/poetry.lock

RUN poetry self add poetry-plugin-export
# Silence "Warning: poetry-plugin-export will not be installed by default in a future version of Poetry"
RUN poetry config warnings.export false
RUN poetry export -f requirements.txt --output requirements.txt

FROM python:3.11-slim-bookworm
LABEL maintainer="<keithamoss@gmail.com>"

WORKDIR /app

# Python config
## Ensures that Python outputs stdout and stderr straight to terimal (e.g. Lambda or local Docker container logs)
ENV PYTHONUNBUFFERED=1
## Prevents Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Django config
ENV DJANGO_SETTINGS_MODULE="mapa.settings"

# See https://github.com/awslabs/aws-lambda-web-adapter#usage
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.2 /lambda-adapter /opt/extensions/lambda-adapter

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y gdal-bin

# Only needed for local dev now
RUN apt-get install -y cron

COPY --from=builder /app/requirements.txt ./
RUN python -m pip install -r requirements.txt

ADD . /app

RUN apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/app/docker-entrypoint.sh"]