import csv
import datetime
import os
from datetime import datetime
from os import environ
from tempfile import NamedTemporaryFile

import pytz
from google.oauth2.credentials import Credentials
from googleapiclient import discovery
from googleapiclient.http import MediaFileUpload
from mapa.app.admin import is_production
from mapa.app.models import Features, FeatureSchemas, Maps

from django.conf import settings
from django.utils.timezone import localtime, now


def write_to_temp_csv_file(data):
    tf = NamedTemporaryFile(mode="w", delete=False)
    writer = csv.writer(tf)

    writer.writerow(data[0].keys())
    for row in data:
        writer.writerow(row.values())
    tf.close()

    return tf

def upload_csv_file(drive, mapaFolderId, filename, tf):
    media = MediaFileUpload(tf.name, mimetype="text/csv")

    # Once our media object is created, it's safe to delete the temp file
    os.unlink(tf.name)

    file = drive.files().create(body={
        "name": filename,
        "parents": [mapaFolderId],
        "appProperties": {
          "createdByMapa": "true",
        }
    }, media_body=media, fields="id").execute()
    
    print(f"'{filename}' File Id: {file.get('id')}")


def export_to_google_drive(user, access_token, refresh_token):
    # files = drive.files().list(q="name contains 'data_*' and mimeType='application/vnd.google-apps.folder' and trashed=false and parents in '" + mapaFolderId + "' and appProperties has { key='createdByMapa' and value='true' }").execute()

    def get_latest_update_date(maps, schemas, features):
        return max([maps.latest("last_updated_date").last_updated_date, schemas.latest("last_updated_date").last_updated_date, features.latest("last_updated_date").last_updated_date])

    def is_backup_required(last_gdrive_backup):
        if last_gdrive_backup is None:
            print("Reason: Backing up because we've never backed up before")
            return True
        if localtime(now()).strftime("%d") == "01":
            print("Reason: Backing up because it's the first of the month")
            return True
        if latest_update_date >= last_gdrive_backup:
            print("Reason: Backing up because data has changed since the last backup")
            return True
        return False
    
    print(f"Last Backup Date: {user.profile.last_gdrive_backup}")

    maps = Maps.objects.filter(deleted_at=None, owner_id=user.id)
    schemas = FeatureSchemas.objects.filter(deleted_at=None, owner_id=user.id)
    features = Features.objects.filter(deleted_at=None, map_id__in=list(maps.values_list("id", flat=True)))

    latest_update_date = get_latest_update_date(maps, schemas, features)
    print(f"Latest Update Date: {latest_update_date}")

    if is_backup_required(user.profile.last_gdrive_backup) is True:
      current_datetime = localtime(now()).strftime("%Y-%m-%dT%H:%M:%S%z")  
      mapaGoogleDriveFolderName = "mapa.keithmoss.me"

      token_uri = "https://oauth2.googleapis.com/token"
      client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
      client_secret = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET
      drive = discovery.build("drive", "v3", credentials=Credentials(access_token, refresh_token, token_uri=token_uri, client_id=client_id, client_secret=client_secret))

      # First, ensure we have our Mapa folder in which we can store the user's data backups
      # https://developers.google.com/drive/api/guides/search-files
      files = drive.files().list(q=f"name='{mapaGoogleDriveFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false").execute()

      if len(files["files"]) == 0:
          print("Mapa folder doesn't exist, creating it...")

          # https://developers.google.com/drive/api/reference/rest/v3/files/create
          file = drive.files().create(body={
              "name": mapaGoogleDriveFolderName,
              "mimeType": "application/vnd.google-apps.folder",
              "appProperties": {
                "createdByMapa": "true",
              }
          }, fields="id").execute()

          mapaFolderId = file.get("id")
      else:
          mapaFolderId = files["files"][0]["id"]

      print(f"Mapa Folder Id: {mapaFolderId}")
      
      # Next, create a new data_* folder to hold this backup
      file = drive.files().create(body={
          "name": f"data_{current_datetime}" if is_production() is True else f"data_{environ.get('ENVIRONMENT')}_{current_datetime}",
          "mimeType": "application/vnd.google-apps.folder",
          "parents": [mapaFolderId],
          "appProperties": {
            "createdByMapa": "true",
          }
      }, fields="id").execute()

      exportFolderId = file.get("id")
      print(f"Backup Folder Id: {exportFolderId}")

      # Next, export the user's data
      upload_csv_file(drive, exportFolderId, f"maps_{current_datetime}.csv", write_to_temp_csv_file(maps.values()))

      upload_csv_file(drive, exportFolderId, f"schemas_{current_datetime}.csv", write_to_temp_csv_file(schemas.values()))

      upload_csv_file(drive, exportFolderId, f"features_{current_datetime}.csv", write_to_temp_csv_file(features.values()))

      # Lastly, update the user's profile
      user.profile.last_gdrive_backup = datetime.now(pytz.utc)
      user.profile.save()

      print("Fin")
    
    else:
        print("No need to backup")