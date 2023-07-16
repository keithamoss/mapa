import json
import os
import re
from pathlib import Path

from shared import get_icon_name, icon_retain_list, pack_discard_list

CATEGORY_HERO_ICONS = {
    # "herbs": "parsley",
    # "plants": "fennel",
    "fruits-(coloured)": "apple-fruits3",
    "vegetables-(coloured)": "broccoli-fruitsandveggies5",
    "herbs-and-spices-(coloured)": "chili-herbsandspices2",
    "nature-(coloured)": "aldar-nature1",
    # "miscellaneous-(coloured)": "argan-miscellaneous1"
}

ICON_FAMILIIES_OUTPUT_JSON = "./flaticon-processed.json"
ICON_CATEGORIES_OUTPUT_JSON = "./flaticon-categories-processed.json"


def processSVGs(icon, path_prefix=""):
    processed = {}

    for style_name, styles in icon["svgs"].items():
        processed[style_name] = styles

        with open(os.path.join(path_prefix, styles["svg"]), "r") as f:
          svg = f.read()

          if "defs" in svg:
              raise Exception(f"<defs> present in svg '{icon['name']}' style '{style_name}' - deal with this through manual editing of the source file.")
          
          # Ensure anything prior to the SVG tag is trimmed out (e.g. <?xml ... >)
          svgTagPosition = svg.find("<svg")
          if svgTagPosition != 0:
              svg = svg[svgTagPosition:].strip()
            
          processed[style_name]["svg"] = re.sub(r"\n\s*", " ", svg).replace("#", "%23")

    return processed


def getCategoriesForIcon(icon_name, categories):
    icon_categories = []

    for category_name, category in categories.items():
        if icon_name in category["icons"]:
            icon_categories.append(category["label"])

    return icon_categories

# ######################
# Icons
# ######################
icons = {}

# Automatically processed icon packs
for icons_file in Path("./icons/working-space/").glob("icons.json"):
    with open(f"{icons_file}", "r") as f:
        for icon_id, icon in json.load(f).items():
            icon_name = get_icon_name(icon_id)
            pack_name = icon_id[icon_id.rfind("-")+1:]

            if pack_name not in pack_discard_list or (pack_name in pack_discard_list and pack_name in icon_retain_list and icon_name in icon_retain_list[pack_name]):
                icons[icon_id] = {
                    "name": icon_id,
                    "label": icon["label"],
                    "categories": icon["categories"],
                    "search": icon["search"],
                    "svgs": processSVGs(icon, os.path.dirname(icons_file)),
                }

# Individually and manually curated icons
# e.g. Fennel and Parsley tritone experiments
# with open(ICON_FAMILIIES_JSON, "r") as f:
#     for icon_name, icon in json.load(f).items():
#         icons[icon_name] = {
#             "name": icon_name,
#             "label": icon["label"],
#             "categories": icon["categories"],
#             "search": icon["search"],
#             "svgs": processSVGs(icon),
#         }

with open(ICON_FAMILIIES_OUTPUT_JSON, "w") as f:
    json.dump(icons, f, indent=4)

# ######################
# Categories
# ######################
categories = {}

for icon_name, icon in icons.items():
    for category_label in icon["categories"]:
        category_name = category_label.lower().replace(" ", "-")

        if category_name not in CATEGORY_HERO_ICONS:
            raise Exception(f"{category_name} not in CATEGORY_HERO_ICONS")
        
        if category_name not in categories:
            categories[category_name] = {
              "name": category_name,
              "label": category_label,
              "hero_icon": CATEGORY_HERO_ICONS[category_name],
              "icons": []
          }

        categories[category_name]["icons"].append(icon_name)

with open(ICON_CATEGORIES_OUTPUT_JSON, "w") as f:
    json.dump(categories, f, indent=4)