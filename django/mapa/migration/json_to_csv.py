import csv
import json
import random

import django

django.setup()

JSON_DATA_FILE_PATH = "./content.json"
IMPORT_JOB_NAME = "20230930 Interesting Maps Migration"
FORAGING_FOLDER_ID = 2
# Local Dev
FORAGING_MAP_ID = 26
FORAGING_SCHEMA_ID = 64
INTERESTING_PERTH_MAP_ID = 27
INTERESTING_SYDNEY_MAP_ID = 28
INTERESTING_SCHEMA_ID = 68
# Production - H
# FORAGING_MAP_ID = 7
# FORAGING_SCHEMA_ID = 6
# INTERESTING_PERTH_MAP_ID = 8
# INTERESTING_SYDNEY_MAP_ID = 9
# INTERESTING_SCHEMA_ID = 8
# Production - K
# FORAGING_MAP_ID = 10
# FORAGING_SCHEMA_ID = 9
# INTERESTING_PERTH_MAP_ID = 11
# INTERESTING_SYDNEY_MAP_ID = 12
# INTERESTING_SCHEMA_ID = 10


def translate_folder_to_map(folderId, folders):
    folder = [f for f in folders if f["id"] == folderId][0]

    if folder is not None:
        if folder["name"] == "Foraging":
            return FORAGING_MAP_ID
        elif folder["name"] == "Interesting Perth":
            return INTERESTING_PERTH_MAP_ID
        elif folder["name"] == "Interesting Sydney":
            return INTERESTING_SYDNEY_MAP_ID

    raise Exception("Unknown folder")


def migrate():
    from mapa.app.enums import GeomType
    from mapa.app.models import Features
    from mapa.app.serializers import FeatureSerializer

    with open(JSON_DATA_FILE_PATH, "r") as f:
        # Features.objects.filter(map_id=FORAGING_MAP_ID).delete()
        # Features.objects.filter(map_id=INTERESTING_PERTH_MAP_ID).delete()
        # Features.objects.filter(map_id=INTERESTING_SYDNEY_MAP_ID).delete()

        data = json.load(f)["data_content"]
        folders = data["folder"]

        csv_out = []

        for feature in data["poi"]:
            if feature["folder_id"] == FORAGING_FOLDER_ID:
                continue

            serializer = FeatureSerializer(data={
                "import_job": IMPORT_JOB_NAME,
                "geom": {
                    "type": "Point",
                    "coordinates": [
                        feature["geometry"]["data"]["longitude"],
                        feature["geometry"]["data"]["latitude"],
                    ]
                },
                "geom_type": GeomType.POINT,
                "map_id": translate_folder_to_map(feature["folder_id"], folders),
                "schema_id": FORAGING_SCHEMA_ID if feature["folder_id"] == FORAGING_FOLDER_ID else INTERESTING_SCHEMA_ID,
                "symbol_id": None,
                "data": [{
                    "value": feature["title"],
                    "schema_field_id": 1
                },{
                    "value": feature["description"],
                    "schema_field_id": 2
                }],
            })

            csv_out.append({
                "id": feature["id"],
                "title": feature["title"],
                "description": feature["description"],
                "folder_id": feature["folder_id"],
                "icon_id": feature["extra_info"]["pin_icon_code"],
            })

            # if feature["extra_info"]["custom_fields"] != []:
            #     print(feature["extra_info"]["custom_fields"])

            if serializer.is_valid() is True:
                # print("is valid!")
                serializer.save()
                # pass
            else:
                print(serializer.data)
                raise Exception("is not valid!")

    with open("map_marker_contents.csv", "w") as f_csv:
        contentsCSV = csv.DictWriter(f_csv, ["id", "title", "description", "folder_id", "icon_id"])
        contentsCSV.writeheader()

        for row in sorted(csv_out, key=lambda d: d["title"]):
            contentsCSV.writerow(row)


migrate()
