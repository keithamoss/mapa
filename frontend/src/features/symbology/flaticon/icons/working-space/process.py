import json
import os
import shutil
from pathlib import Path
from xml.dom import minidom

FOLDERS = ["_fruits", "_vegetables", "_fruits-and-veggies", "_herbs-and-spices", "_nature", "_assorted-food", "_miscellaneous"]
FOLDER_TO_CATEGORY_MAPPING = {
  "_fruits": {"categories": ["Fruits (Coloured)"], "terms": ["fruit"]},
  "_vegetables": {"categories": ["Vegetables (Coloured)"], "terms": ["vegetable", "veggies"]},
  # Not used. Icons are split up into separate fruit and veg categories
  "_fruits-and-veggies": {"categories": None, "terms": None},
  "_herbs-and-spices": {"categories": ["Herbs and Spices (Coloured)"], "terms": ["herb", "spice", "weasel", "bam!"]},
  "_nature": {"categories": ["Nature (Coloured)"], "terms": ["nature"]},
  "_assorted-food": {"categories": ["Assorted Food (Coloured)"], "terms": ["food"]},
  # Not used. Icons are split up into separate fruit and veg categories
  "_miscellaneous": {"categories": None, "terms": None}
}
FRUITSANDVEG_TO_FRUITS_MAPPING = ["tomato","pineapple","kiwi","melon","strawberry","physalis","apple","lemon","pear","banana","peach","coconut","orange","cherry","cherries","pomegranate","rose apple","mango","papaya","date palm","quince","durian","lychee","starfruit","star fruit","dragon fruit","passionfruit","custard apple","berries","mangosteen","fruit","raspberry","goji","watermelon","grapes","fig","blackberry","plum","blueberry","melon-1","tomato-1","orange-1","grenade","watermelon-1","grape","bananas","rose apple"]
MISCELLANEOUS_TO_FRUITS_MAPPING = ["berry", "sapote", "black sapote", "white sapote", "blood orange"]
ICON_OUTPUT_JSON = "icons.json"
ICONS = {}

for top_level_folder in FOLDERS:
  print(f"#### {top_level_folder} ####")

  icons_dir = os.path.join(os.getcwd(), top_level_folder)

  if top_level_folder not in FOLDER_TO_CATEGORY_MAPPING:
    raise Exception(f"{top_level_folder} has no metadata mapping")
  metadata = FOLDER_TO_CATEGORY_MAPPING[top_level_folder]

  processed_icons_dir = os.path.join(icons_dir, "_processed")
  if os.path.exists(processed_icons_dir):
    shutil.rmtree(processed_icons_dir)
  Path(processed_icons_dir).mkdir(parents=True, exist_ok=True)

  # Bring the icons together into the processed folder
  for folder in Path(icons_dir).glob("*/svg/"):
    if folder.is_file() is False:
      print(folder)

      pack_prefix = os.path.basename(os.path.dirname(folder)).split("-")[0]
      print(pack_prefix)

      style_name = "-".join(os.path.basename(os.path.dirname(folder)).split("-")[1:])
      print(style_name)

      SVG_DIR = os.path.join(processed_icons_dir, pack_prefix, style_name)
      Path(SVG_DIR).mkdir(parents=True, exist_ok=True)

      shutil.copytree(folder, SVG_DIR, dirs_exist_ok=True)

      svg_file_names_sans_number = []

      for svg_file in Path(SVG_DIR).glob('*.svg'):
        svg_file_name = os.path.basename(svg_file)
        svg_file_name_sans_number = "".join(svg_file_name.split("-")[1:])

        if svg_file_name_sans_number in svg_file_names_sans_number and svg_file_name_sans_number not in ["leaf.svg", "holly.svg", "palm.svg", "aspen.svg", "berry.svg"]:
          raise Exception(f"svg_file_name_sans_number already contains '{svg_file_name_sans_number}' - might need to manually rename it?")
        svg_file_names_sans_number.append(svg_file_name_sans_number)
        
        icon_name = "-".join(os.path.splitext(svg_file_name)[0].split("-")[1:]).replace(" ", "-")
        # print("icon_name", icon_name)
        
        unique_icon_name = f"{icon_name}-{pack_prefix}".lower()
        print(unique_icon_name)

        # Ensure fruits in the 'Fruits and Veggies' pack land in the 'Fruits (Coloured)' category
        if top_level_folder == "_fruits-and-veggies" or top_level_folder == "_miscellaneous":
          if icon_name.lower().replace("-", " ") in FRUITSANDVEG_TO_FRUITS_MAPPING or icon_name.lower().replace("-", " ") in MISCELLANEOUS_TO_FRUITS_MAPPING:
            metadata = FOLDER_TO_CATEGORY_MAPPING["_fruits"]
          else:
            # Technically some of these are nuts, but whatever
            metadata = FOLDER_TO_CATEGORY_MAPPING["_vegetables"]

        if unique_icon_name not in ICONS:
            ICONS[unique_icon_name] =  {
              "name": unique_icon_name,
              # "label": f"{icon_name.title()} ({pack_prefix})",
              "label": icon_name.title().replace("-", " "),
              "categories": metadata["categories"],
              "search": {
                "terms": metadata["terms"]
              },
              "svgs": {}
            }
        
        if style_name == "coloured":
          ICONS[unique_icon_name]["svgs"]["coloured"] = {
            "colour_locked": True,
            "svg": f"{svg_file}"
          }
        elif style_name == "coloured-outlined":
          ICONS[unique_icon_name]["svgs"]["coloured-outlined"] = {
            "colour_locked": True,
            "svg": f"{svg_file}"
          }
        elif style_name == "outlined":
          ICONS[unique_icon_name]["svgs"]["outlined"] = {
            "svg": f"{svg_file}"
          }
        elif style_name == "solid":
          ICONS[unique_icon_name]["svgs"]["solid"] = {
            "svg": f"{svg_file}"
          }
        else:
          raise Exception(f"Unknown style name {style_name}")

        # doc = minidom.parse(f"{svg_file}")
        # colours_seen = []
        # for path in doc.getElementsByTagName("path"):
        #   fill = path.getAttribute("fill")

        #   if fill != "":
        #     if fill not in colours_seen:
        #       colours_seen.append(fill)
        #     path.setAttribute("class", f"colour{len(colours_seen)}")
          
        # for g in doc.getElementsByTagName("g"):
        #   fill = g.getAttribute("fill")

        #   if fill != "":
        #     if fill not in colours_seen:
        #       colours_seen.append(fill)
        #     g.setAttribute("class", f"colour{len(colours_seen)}")

        # with open(svg_file, "w") as f:
        #   # print(doc.toprettyxml())
        #   f.write(doc.toprettyxml())
  
  print("")
  print("#########")
  print("")

with open(ICON_OUTPUT_JSON, "w") as f:
    json.dump(ICONS, f, indent=4)