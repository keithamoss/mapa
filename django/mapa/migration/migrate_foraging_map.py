import csv
import json

import django
from django.forms.models import model_to_dict

django.setup()

IMPORT_JOB_NAME = "20230926 Foraging Map Migration"
JSON_DATA_FILE_PATH = "./content.json"
CSV_DATA_FILE_PATH = "./MIGRATED_map_marker_contents_30Aug2023 - map_marker_contents_30Aug2023.csv"
# Local Dev
FORAGING_MAP_ID = 26
FORAGING_SCHEMA_ID = 67
# Production
# FORAGING_MAP_ID = 7
# FORAGING_SCHEMA_ID = 6

def migrate():
    from mapa.app.enums import GeomType
    from mapa.app.models import Features, FeatureSchemas
    from mapa.app.serializers import FeatureSerializer

    # Check for (and manually purge) any features already imported by this import job
    feats = Features.objects.filter(import_job=IMPORT_JOB_NAME)
    if len(feats) > 0:
      # feats.delete()
      raise Exception("Found some features already imported")

    # Grab symbols from our schema
    foragingSchema = model_to_dict(FeatureSchemas.objects.get(id=FORAGING_SCHEMA_ID))
    symbols = {}
    for symbol in foragingSchema["symbology"]["symbols"]:
      symbol_name = symbol["props"]["name"].lower()
      if symbol_name in symbols:
          raise Exception(symbol_name)
      symbols[symbol_name] = symbol

    # Grab the original Map Marker JSON file
    with open(JSON_DATA_FILE_PATH, "r") as f:
        json_pois = {}
        for feature in json.load(f)["data_content"]["poi"]:
            if feature["id"] in json_pois:
                raise Exception(feature["id"])
            json_pois[str(feature["id"])] = feature
    
    # Grab the migrated Map Marker CSV file that maps across to Mapa symbols
    with open(CSV_DATA_FILE_PATH, "r") as f:
        csv_file = csv.DictReader(f)

        csv_pois = {}
        for feature in csv_file:
            if feature["id"] in csv_pois:
                raise Exception(feature["id"])
            csv_pois[str(feature["id"])] = feature

    for featureId, feature in csv_pois.items():
        print(featureId)
        if featureId not in json_pois:
            raise Exception(featureId)
        
        json_feature = json_pois[featureId]

        # Make sure the matching symbol exists
        symbol_name = feature["icon_field"].lower()
        if symbol_name not in symbols:
          raise Exception(symbol_name)
        symbol = symbols[symbol_name]

        # Build the data object
        data = []
        if feature["attr_has_lots"] == "1":
          data.append({
            "value": True,
            "schema_field_id": 1
          })
        if feature["attrs_is_high"] == "1":
          data.append({
            "value": True,
            "schema_field_id": 2
          })
        if feature["attrs_uncertain"] == "1":
          data.append({
            "value": True,
            "schema_field_id": 3
          })

        serializer = FeatureSerializer(data={
          "import_job": IMPORT_JOB_NAME,
          "geom": {
            "type": "Point",
            "coordinates": [
              json_feature["geometry"]["data"]["longitude"],
              json_feature["geometry"]["data"]["latitude"]
            ]
          },
          "geom_type": "Point", 
          "map_id": FORAGING_MAP_ID,
          "schema_id": FORAGING_SCHEMA_ID,
          "symbol_id": symbol["id"],
          "data": data
        })

        if serializer.is_valid() is True:
            # pass
            # print("save")
            # print(serializer.data)
            serializer.save()
            # exit()
        else:
            raise Exception(serializer.errors)
        
        # exit()
  
    print("Fin.")

migrate()
