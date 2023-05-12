import json
import random

import django

django.setup()

JSON_DATA_FILE_PATH = "./content.json"
FORAGING_FOLDER_ID = 2
FORAGING_MAP_ID = 22
FORAGING_SCHEMA_ID = 64


def translate_folder_to_map(folderId, folders):
    folder = [f for f in folders if f["id"] == folderId][0]

    if folder is not None:
        if folder["name"] == "Foraging":
            return FORAGING_MAP_ID
        elif folder["name"] == "Interesting Perth":
            return -1
        elif folder["name"] == "Interesting Sydney":
            return -1

    raise Exception("Unknown folder")


def migrate():
    from mapa.app.enums import GeomType
    from mapa.app.models import Features
    from mapa.app.serializers import FeatureSerializer

    with open(JSON_DATA_FILE_PATH, "r") as f:
        Features.objects.filter(map_id=FORAGING_MAP_ID).delete()

        data = json.load(f)["data_content"]
        folders = data["folder"]

        for feature in data["poi"]:
            # print(feature)

            serializer = FeatureSerializer(data={
                "geom_type": GeomType.POINT,
                "map_id": translate_folder_to_map(feature["folder_id"], folders),
                "geom": {
                    "type": "Point",
                    "coordinates": [
                        feature["geometry"]["data"]["longitude"],
                        feature["geometry"]["data"]["latitude"],
                    ]
                },
                "schema_id": FORAGING_SCHEMA_ID,
                "data": [],
                "symbol_id": random.randint(1, 9)
            })

            if feature["folder_id"] != FORAGING_FOLDER_ID:
                continue

            # if feature["extra_info"]["custom_fields"] != []:
            #     print(feature["extra_info"]["custom_fields"])

            if serializer.is_valid() is True:
                # print("is valid!")
                serializer.save()
                # pass
            else:
                print(serializer.data)
                raise Exception("is not valid!")

            # break


migrate()
