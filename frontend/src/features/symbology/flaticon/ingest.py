import json
import re

# This was last run on @fortawesome/fontawesome-svg-core@6.4.0

CATEGORY_HERO_ICONS = {
    "herbs": "parsley",
    "plants": "fennel",
}

# ICON_CATEGORIES_JSON = "./categories.json"
ICON_FAMILIIES_JSON = "./flaticon.json"

ICON_FAMILIIES_OUTPUT_JSON = "./flaticon-processed.json"
ICON_CATEGORIES_OUTPUT_JSON = "./flaticon-categories-processed.json"


def processSVGs(icon):
    processed = {}

    for style_name, styles in icon["svgs"].items():
        processed[style_name] = styles

        with open(styles["svg"], "r") as f:
          processed[style_name]["svg"] = re.sub(r"\n\s*", " ", f.read())

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
with open(ICON_FAMILIIES_JSON, "r") as f:
    for icon_name, icon in json.load(f).items():
        icons[icon_name] = {
            "name": icon_name,
            "label": icon["label"],
            "categories": icon["categories"],
            "search": icon["search"],
            "svgs": processSVGs(icon),
        }

with open(ICON_FAMILIIES_OUTPUT_JSON, "w") as f:
    json.dump(icons, f)

# ######################
# Categories
# ######################
categories = {}

for icon_name, icon in icons.items():
    for category_label in icon["categories"]:
        category_name = category_label.lower().replace(" ", "-")
        if category_name not in categories:
            categories[category_name] = {
              "name": category_name,
              "label": category_label,
              "hero_icon": CATEGORY_HERO_ICONS[category_name],
              "icons": []
          }

        categories[category_name]["icons"].append(icon_name)

with open(ICON_CATEGORIES_OUTPUT_JSON, "w") as f:
    json.dump(categories, f)