import json

FONTAWESOME_ICONS = "./font-awesome/pro/icon-families-processed-v2.json"
FONTAWESOME_CATEGORIES = "./font-awesome/pro/categories-processed-v2.json"

FLATICON_ICONS = "./flaticon/flaticon-processed.json"
FLATICON_CATEGORIES = "./flaticon/flaticon-categories-processed.json"

ICONS_OUTPUT_JSON = "./icons-library.json"
CATEGORIES_OUTPUT_JSON = "./icons-categories-library.json"

# ######################
# Icons
# ######################
icons = {}
for icon_file in [FONTAWESOME_ICONS, FLATICON_ICONS]:
  with open(icon_file, "r") as f:
      fileJSON = json.load(f)
      for icon_name, icon in fileJSON.items():
          if icon_name in icons:
              raise Exception(f"{icon_name} already exists in the library!")
          
      icons |= fileJSON

with open(ICONS_OUTPUT_JSON, "w") as f:
    json.dump(icons, f, indent=4)

# ######################
# Categories
# ######################
categories = {}
for category_file in [FONTAWESOME_CATEGORIES, FLATICON_CATEGORIES]:
  with open(category_file, "r") as f:
      fileJSON = json.load(f)
      for category_name, category in fileJSON.items():
          if category_name in categories:
              raise Exception(f"{category_name} already exists in the library!")
          
      categories |= fileJSON

for category_name, category in categories.items():
    categories[category_name]["icons"] = sorted(categories[category_name]["icons"])

with open(CATEGORIES_OUTPUT_JSON, "w") as f:
    json.dump(dict(sorted(categories.items())), f, indent=4)