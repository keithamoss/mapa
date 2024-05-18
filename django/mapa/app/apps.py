from os import environ

from django.apps import AppConfig


class MyAppConfig(AppConfig):
    name = 'mapa.app'

    def ready(self):
        import mapa.app.signals  # noqa

        # from mapa.app.admin import is_production
        # # Otherwise this would run every time Django reloads due to code changes in development
        # if is_production() is True and environ.get("BUILD") != "YES":
        #     pass
