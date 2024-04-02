from os import environ

from django.contrib import admin
from django.contrib.auth.models import User
from django.db import connection

from .models import Profile

# Register your models here.
admin.register(Profile)(admin.ModelAdmin)


def get_super_admins():
    return ["keithamoss@gmail.com"]


def get_admins():
    if "auth_user" in connection.introspection.table_names():
        return User.objects.filter(is_staff=True, is_superuser=True, is_active=True).all()
    else:
        return []


def is_admin(user):
    return user in get_admins()


def is_development():
    return environ.get("ENVIRONMENT") == "DEVELOPMENT"


def is_staging():
    return environ.get("ENVIRONMENT") == "STAGING"


def is_production():
    return environ.get("ENVIRONMENT") == "PRODUCTION"


def are_management_tasks_allowed():
    return environ.get("ALLOW_MANAGEMENT_API") == "TRUE"

