import os
import traceback

import django
from django.utils.timezone import localtime, now

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mapa.settings")
django.setup()

from mapa.app.export import export_to_google_drive
from social_django.models import UserSocialAuth

print("")
print("###########")
print("Cron beginning")
print(localtime(now()))
print("###########")
print("")

for socialAuthUser in UserSocialAuth.objects.all():
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