import os
import traceback

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mapa.settings")
django.setup()

from mapa.app.export import export_to_google_drive
from social_django.models import UserSocialAuth

for socialAuthUser in UserSocialAuth.objects.all():
    try:
        export_to_google_drive(socialAuthUser.user, socialAuthUser.extra_data["access_token"], socialAuthUser.extra_data["refresh_token"])
    except:
        traceback.print_exc()

print("Cron finished.")