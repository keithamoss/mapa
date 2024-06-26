import json

# This was last run on @fortawesome/fontawesome-svg-core@6.5.2

CATEGORY_HERO_ICONS = {
    "accessibility": "universal-access",
    "alert": "bell-on",
    "alphabet": "circle-a",
    "animals": "cat",
    "arrows": "square-up-right",
    "astronomy": "planet-ringed",
    "automotive": "car-side",
    "buildings": "landmark",
    "business": "briefcase",
    "camping": "campfire",
    "charity": "hands-holding-heart",
    "charts-diagrams": "chart-simple",
    "childhood": "balloons",
    "clothing-fashion": "shirt",
    "coding": "code",
    "communication": "message-dots",
    "connectivity": "signal-bars",
    "construction": "person-digging",
    "design": "palette",
    "devices-hardware": "computer-classic",
    "disaster": "burst",
    "editing": "pen-line",
    "education": "graduation-cap",
    "emoji": "face-grin-wink",
    "energy": "bolt",
    "files": "files",
    "film-video": "film",
    "food-beverage": "burger-soda",
    "fruits-vegetables": "strawberry",
    "gaming": "joystick",
    "gender": "venus-mars",
    "halloween": "jack-o-lantern",
    "hands": "hand",
    "holidays": "party-horn",
    "household": "bed-front",
    "humanitarian": "parachute-box",
    "logistics": "truck-fast",
    "maps": "map",
    "maritime": "anchor",
    "marketing": "bullseye-arrow",
    "mathematics": "abacus",
    "media-playback": "play-pause",
    "medical-health": "stethoscope",
    "money": "money-bill-simple",
    "moving": "box-taped",
    "music-audio": "music",
    "nature": "trees",
    "numbers": "circle-2",
    "photos-images": "camera-retro",
    "political": "check-double",
    "punctuation-symbols": "quote-left",
    "religion": "person-praying",
    "science": "atom-simple",
    "science-fiction": "raygun",
    "security": "shield",
    "shapes": "shapes",
    "shopping": "bag-shopping",
    "social": "hashtag",
    "spinners": "rotate",
    "sports-fitness": "heart-pulse",
    "text-formatting": "text-size",
    "time": "calendar-days",
    "toggle": "toggle-on",
    "transportation": "taxi-bus",
    "travel-hotel": "spa",
    "users-people": "people-simple",
    "weather": "cloud-sun",
    "writing": "typewriter",
}

ICON_CATEGORIES_JSON = "./pro/categories.json"
ICON_FAMILIIES_JSON = "./pro/icon-families.json"

ICON_CATEGORIES_OUTPUT_JSON = "./pro/categories-processed-v2.json"
ICON_FAMILIIES_OUTPUT_JSON = "./pro/icon-families-processed-v2.json"


def processSVGs(icon):
    processed = {}

    for family_name, styles in icon["svgs"].items():
        for style_name, svg in icon["svgs"][family_name].items():
            if style_name == "brands":
                processed["brands"] = {}
                processed["brands"] = {
                    "svg": svg["raw"]
                }
            else:
                if family_name == "duotone":
                    mapa_style_name = family_name

                    if mapa_style_name not in processed:
                        processed[mapa_style_name] = {}

                    processed[mapa_style_name] = {
                        "svg": svg["raw"].replace("fa-primary", "primary").replace("fa-secondary", "secondary")
                    }

                else:
                    mapa_style_name = f"{family_name}-{style_name}" if family_name == 'sharp' else style_name
                    
                    if mapa_style_name not in processed:
                        processed[mapa_style_name] = {}
                    
                    processed[mapa_style_name] = {
                        "svg": svg["raw"]
                    }

    # print(processed)
    return processed


def getCategoriesForIcon(icon_name, categories):
    icon_categories = []

    for category_name, category in categories.items():
        if icon_name in category["icons"]:
            icon_categories.append(category["label"])

    return icon_categories


# ######################
# Categories
# ######################
categories = {}
with open(ICON_CATEGORIES_JSON, "r") as f:
    for category_name, category in json.load(f).items():
        categories[category_name] = {"name": category_name, "hero_icon": CATEGORY_HERO_ICONS[category_name]} | category

with open(ICON_CATEGORIES_OUTPUT_JSON, "w") as f:
    json.dump(categories, f)

# ######################
# Font Awesome Icons
# ######################
icons = {}
with open(ICON_FAMILIIES_JSON, "r") as f:
    for icon_name, icon in json.load(f).items():
        icons[icon_name] = {
            "name": icon_name,
            "label": icon["label"],
            "categories": getCategoriesForIcon(icon_name, categories),
            "search": icon["search"],
            "svgs": processSVGs(icon),
        }

with open(ICON_FAMILIIES_OUTPUT_JSON, "w") as f:
    json.dump(icons, f)
