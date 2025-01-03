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