"""
Django settings for mapa project.

Generated by 'django-admin startproject' using Django 1.10.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os
import pathlib

import sentry_sdk
from aws_lambda_powertools import Logger
from corsheaders.defaults import default_headers
from mapa.app.envs import is_running_in_aws_lambda
from mapa.util import get_secret_from_ssm_or_local_env_var
from sentry_sdk.integrations.django import DjangoIntegration

logger = Logger()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = get_secret_from_ssm_or_local_env_var("SECRET_KEY")

# Security
SECURE_SSL_REDIRECT = False if is_running_in_aws_lambda() is True else True # Set this to False if you want to test in local dev from inside the Django container
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') # https://stackoverflow.com/a/22284717
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS_AND_WHITELIST").split(",")

SESSION_COOKIE_DOMAIN = os.environ.get("SESSION_COOKIE_DOMAIN")
SESSION_COOKIE_AGE = 60 * 60 * 24 * 400 # Chrome limits cookies to expiring no more than 400 days in the future

CSRF_TRUSTED_ORIGINS = os.environ.get("ALLOWED_HOSTS_AND_WHITELIST").split(",")
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = os.environ.get("CSRF_COOKIE_DOMAIN")

CORS_ALLOWED_ORIGINS = os.environ.get("ALLOWED_HOSTS_AND_WHITELIST").split(",")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = default_headers + (
    "Content-Disposition",
)

CONN_MAX_AGE = 10

if is_running_in_aws_lambda() is True:
    # tl;dr Lambda's don't have first class support for custom domains yet, but they do
    # now have Lambda Public URLs, so we (ab)use that to get ourselves a custom domain
    # working (api.mapa.keithmoss.me => CNAME => Lambda Public URL) without having to go
    # through API Gateway as was the case in the past.
    # When we're deployed to AWS as a Lambda we're behind a proxy of a sort by virtue of
    # how Lambda Public URLs need us to drop the Host header (in CloudFront) to allow them
    # to add their own Host header. That screws up Django's own view of where it's hosted
    # on our own custom domain (api.mapa.keithmoss.me), so we resolve that by injecting
    # the X-Forwared-Host header in CloudFront and telling Django to use that over the
    # regular Host header (the Lambda Public URL).
    USE_X_FORWARDED_HOST = True

if os.environ.get("ENVIRONMENT") == "PRODUCTION" or os.environ.get("ENVIRONMENT") == "STAGING":
    DEBUG = os.environ.get("DJANGO_DEBUG") == "TRUE"

    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/1.10/howto/static-files/

    # The absolute path to the directory where ./manage.py collectstatic will collect static files for deployment
    STATIC_ROOT = "/app/static"

    STATIC_URL = f"{os.environ.get('PUBLIC_SITE_URL')}/api/"

    # Only needed in the old-school "Run it on a Droplet/EC2" deployment scenario
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "verbose": {
                "format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s"
            },
        },
        "handlers": {
            "file": {
                "level": "INFO",
                "class": "logging.FileHandler",
                "filename": "/app/logs/django.log",
                "formatter": "verbose",
            },
        },
        "loggers": {
            "django": {
                "handlers": ["file"],
                "level": "INFO",
                "propagate": True,
            },
        },
    }
else:
    DEBUG = True

    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "static")
    ]
    for static_dir in STATICFILES_DIRS:
        pathlib.Path(static_dir).mkdir(exist_ok=True)
    
    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/1.10/howto/static-files/

    STATIC_URL = '/api/static/'


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'social_django',
    'mapa.app',
    'rest_framework',
    'rest_framework_gis',
    'corsheaders',
    'simple_history',
    'django_filters',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
]

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
)

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    # 'social_core.pipeline.social_auth.social_uid',
    'mapa.app.auth.social_uid',
    # 'social_core.pipeline.social_auth.auth_allowed',
    'mapa.app.auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    # 'social_core.pipeline.user.create_user',
    'mapa.app.auth.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    'mapa.app.auth.get_avatar',
)

ROOT_URLCONF = 'mapa.urls'

LOGIN_URL = os.environ.get("SITE_BASE_URL")
LOGIN_REDIRECT_URL = os.environ.get("SITE_BASE_URL")
SOCIAL_AUTH_REDIRECT_IS_HTTPS = True

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = get_secret_from_ssm_or_local_env_var('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = get_secret_from_ssm_or_local_env_var('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET')

# Prompt consent because of https://github.com/googleapis/google-api-python-client/issues/213
SOCIAL_AUTH_GOOGLE_OAUTH2_AUTH_EXTRA_ARGUMENTS = {'access_type': 'offline', 'prompt': 'consent'}

SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    # https://developers.google.com/identity/protocols/oauth2/scopes
    # See, edit, create, and delete only the specific Google Drive files you use with this app
    'https://www.googleapis.com/auth/drive.file'
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'OPTIONS': {
            # Assumes PostGIS was installed with defaults (i.e. its in the public schema)
            # https://stackoverflow.com/a/26289219/7368493
            'options': '-c search_path={},public,topology'.format(get_secret_from_ssm_or_local_env_var('DB_SCHEMA'))
        },
        'NAME': get_secret_from_ssm_or_local_env_var('DB_NAME'),
        'USER': get_secret_from_ssm_or_local_env_var('DB_USERNAME'),
        'PASSWORD': get_secret_from_ssm_or_local_env_var('DB_PASSWORD'),
        'HOST': get_secret_from_ssm_or_local_env_var('DB_HOST'),
        'PORT': get_secret_from_ssm_or_local_env_var('DB_PORT'),
    },
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Django REST Framework

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    # 'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema'
}

# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-au'

TIME_ZONE = 'Australia/Perth'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Model defaults

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

# Sentry SDK

if os.environ.get("ENVIRONMENT") == "PRODUCTION" or os.environ.get("ENVIRONMENT") == "STAGING":
    sentry_sdk.init(
        dsn=get_secret_from_ssm_or_local_env_var("SENTRY_DSN"),
        integrations=[DjangoIntegration()],
        send_default_pii=True,
        environment=f"{os.environ.get('ENVIRONMENT')}-BACKEND".upper()
    )

    with sentry_sdk.configure_scope() as scope:
        scope.level = "warning"
        scope.set_extra("site", os.environ.get("SENTRY_SITE_NAME"))


# Project-specific settings
