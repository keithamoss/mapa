from mapa.util import get_env, make_logger

from django.apps import AppConfig

logger = make_logger(__name__)


class MyAppConfig(AppConfig):
    name = 'mapa.app'

    def ready(self):
        import mapa.app.signals  # noqa

        # from mapa.app.admin import is_production
        # # Otherwise this would run every time Django reloads due to code changes in development
        # if is_production() is True and get_env("BUILD") != "YES":
        #     pass
