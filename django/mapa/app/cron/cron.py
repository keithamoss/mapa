import sys

# Needed for running as a Lambda, otherwise we run into "ModuleNotFoundError: No module named 'mapa'" during django.setup()
sys.path.append("/app/")

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mapa.settings")

django.setup()

from mapa.app.export import orchestrate_google_drive_backup

orchestrate_google_drive_backup()
