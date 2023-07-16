import json

from shared import get_icon_name, icon_retain_list

ICON_FAMILIIES_JSON = "./flaticon-processed.json"

icons_required = ["Kumquat","Loquat","Fig","Chives","Parsley","Basil","Pomegranate","Lavender","Lavender","Chilli","Coriander","Dill","Nasturtium","Nettle","Rose Hip","Passionfruit","Papaya","Oregano","Oranges","Olives","Mango","Lillypilly","Lemon","Guava","Plum","Illawarra Plum","Kaffir Plum","Grape","Grapefruit","Elderflower","Crabapple","Capsicum","Blackberry","Banana","Apricot","Avocado","Amaranth","Apple","Aniseed","Blood Orange","Black Sapote","White Sapote","Peppperberry Tree","Brazillian Peppertree","Tomato","Cherry Tomato","Fejoa","Nectarine","Pear","Prickly Pear","Peas","Sage","Soft Fruit","Turkey Berry"]
pack_ignore_list = ["nature1", "nature2", "nature3", "miscellaneous1", "fruits7", "fruits5", "fruits8", "fruits1", "fruits9", "vegetables6", "vegetables4", "vegetables3", "vegetables7", "herbsandspices2", "herbsandspices3", "fruitsandveggies1", "fruits3", "herbsandspices1", "fruits4"] # Packs we know we want to keep

def process_required_icon_name(icon_name):
  icon_name_processed = icon_name.lower().replace(" ", "-")
  if icon_name_processed == "passionfruit":
      icon_name_processed = "passion-fruit"
  if icon_name_processed == "oranges":
      icon_name_processed = "orange"
  if icon_name_processed == "fejoa":
      icon_name_processed = "feijoa"
  if icon_name_processed == "turkey-berry" or icon_name_processed == "brazillian-peppertree" or icon_name_processed == "peppperberry-tree":
      icon_name_processed = "berry"
  if icon_name_processed == "soft-fruit":
      icon_name_processed = "nectarine"

  return icon_name_processed

with open(ICON_FAMILIIES_JSON, "r") as f:
    icons = json.load(f)

icon_name_uniqueness_count = {}
for icon_id in icons:
    icon_name = get_icon_name(icon_id)
    pack_name = icon_id[icon_id.rfind("-")+1:]

    if icon_name not in icon_name_uniqueness_count:
        icon_name_uniqueness_count[icon_name] = 0
    icon_name_uniqueness_count[icon_name] += 1

icon_name_uniqueness_count = {k: v for k, v in sorted(icon_name_uniqueness_count.items(), reverse=True, key=lambda item: item[1])}
print(f"Count of unique icons: {len(icon_name_uniqueness_count)}")
print("")

pack_uniqueness = {}

for icon_id in icons:
    icon_name = get_icon_name(icon_id)
    pack_name = icon_id[icon_id.rfind("-")+1:]

    if pack_name not in pack_ignore_list and pack_name not in icon_retain_list and icon_name_uniqueness_count[icon_name] == 1:
      if pack_name not in pack_uniqueness:
          pack_uniqueness[pack_name] = []
      pack_uniqueness[pack_name].append(icon_name)

for pack_name, unique_icons in pack_uniqueness.items():
    print(pack_name)
    print(unique_icons)
    print("")

print("Required icons:")
for icon_name in icons_required:
    icon_name_processed = process_required_icon_name(icon_name)

    if icon_name_processed not in icon_name_uniqueness_count.keys():
        print(icon_name_processed)