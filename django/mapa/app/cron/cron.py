import sys

# Needed for running as a Lambda, otherwise we run into "ModuleNotFoundError: No module named 'mapa'" during django.setup()
sys.path.append("/app/")

import os
import traceback

import django
from django.utils.timezone import localtime, now

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mapa.settings")

django.setup()

from mapa.app.admin import get_admins, is_production
from mapa.app.export import export_to_google_drive
from social_django.models import UserSocialAuth

print("")
print("###########")
print("Cron beginning")
print(localtime(now()))
print("###########")
print("")

for socialAuthUser in UserSocialAuth.objects.all() if is_production() is True else UserSocialAuth.objects.filter(id__in=get_admins()):
    try:
        print(f"User: {socialAuthUser.user}")

        export_to_google_drive(socialAuthUser.user, socialAuthUser.extra_data["access_token"], socialAuthUser.extra_data["refresh_token"])
    except:
        traceback.print_exc()

    print("")
    print("------------")
    print("")

print("###########")
print("Cron finished")
print("###########")