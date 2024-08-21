import glob
import json
import os
import pathlib
import re

FILE_TYPE = "svg"
BASE_PATH = "icons/working-space/"
PACK_PATHS = [
  # {
  #   "foldername": "_adventure-sports",
  #   "subfolders": [
  #     "adventuresports-coloured",
  #     "adventuresports-outlined",
  #     "adventuresports-solid"
  #   ]
  # },
  # {
  #   "foldername": "_sea-life",
  #   "subfolders": [
  #     "sealife-coloured",
  #     "sealife-outlined",
  #     "sealife-solid"
  #   ]
  # },
  # {
  #   "foldername": "_nature",
  #   "subfolders": [
  #     "nature4-coloured",
  #     "nature4-outlined",
  #     "nature4-solid"
  #   ]
  # },
  # {
  #   "foldername": "_odds-and-ends",
  #   "subfolders": [
  #     "miscellaneous-outlined",
  #   ]
  # },
]

def getAllIconsInFolder(path, allowSpacesInIconNames = False):
  icons = []
  
  for file_path in glob.glob(f"{os.path.join(BASE_PATH, path, FILE_TYPE)}/*.{FILE_TYPE}"):
    filnameSansExt = pathlib.Path(file_path).stem
    regex = r"^[0-9]{3}\-(?P<icon_name>[0-9A-z\-]+?)-?(?P<icon_num>[0-9]{0,1})$" if allowSpacesInIconNames is False else r"^[0-9]{3}\-(?P<icon_name>[0-9A-z\-\s]+?)-?(?P<icon_num>[0-9]{0,1})$"

    matched = re.match(regex, filnameSansExt)

    if matched is not None:
      icons.append({
        "filename": os.path.basename(file_path),
        "filnameSansExt": filnameSansExt,
        "ext": pathlib.Path(file_path).suffix,
        "icon_name": matched.group("icon_name"),
        "icon_num": matched.group("icon_num"),
      })
    else:
      raise Exception(f"Icon file {file_path} failed to match our regex")
  
  return icons

def getMatchingIcon(icons, icon):
  matching = []

  for i in icons:
    if i["icon_name"] == icon["icon_name"] and i["filename"] != icon["filename"]:
      matching.append(i)
  
  return matching

def groupIconsByName(icons):
  grouped = {}

  for i in icons:
    if i["icon_name"] not in grouped:
      grouped[i["icon_name"]] = []

    grouped[i["icon_name"]].append(i)

  groupedMany = {}
  for icon_name, grouped_icons in grouped.items():
    if len(grouped_icons) > 1:
      groupedMany[icon_name] = grouped[icon_name]

  return groupedMany

def getNextGroupNumFromGroupedIcons(groupedIcons):
  iconNumberInts = []
  
  for i in groupedIcons:
    if i["icon_num"] != "":
      iconNumberInts.append(int(i["icon_num"]))
  
  # In case there's no numbering at all
  return max(iconNumberInts) + 1 if len(iconNumberInts) > 0 else 1

def checkSubfoldersAreIdenticalOrRaiseException(pack):
  subfolderIcons = []
  
  for subfolder in pack["subfolders"]:
    path = os.path.join(pack["foldername"], subfolder)
    subfolderIcons.append(getAllIconsInFolder(path, True))
  
  firstSubfolderIcons = json.dumps(subfolderIcons[0])
  for icons in subfolderIcons[1:]:
    if json.dumps(icons) != firstSubfolderIcons:
      raise Exception(f"Pack {pack["foldername"]} has subfolders that aren't identical")

def renameIconsWithSpacesInTheirNames(pack):
  for subfolder in pack["subfolders"]:
    path = os.path.join(pack["foldername"], subfolder)
    icons = getAllIconsInFolder(path, True)
    
    for i in icons:
      if " " in i["icon_name"]:
        print(i["icon_name"])
        
        newFilename = i["filename"].replace(" ", "-")
        print(f"Renamed {i["filename"]} to {newFilename}")
        
        fullPath = os.path.join(os.getcwd(), BASE_PATH, path, FILE_TYPE, i["filename"])
        fullPathNew = os.path.join(os.getcwd(), BASE_PATH, path, FILE_TYPE, newFilename)
        os.rename(fullPath, fullPathNew)
        
        print("")

for pack in PACK_PATHS:
  # If they're identical going in, they'll be renamed all the same and we don't need to check the renaming operations
  checkSubfoldersAreIdenticalOrRaiseException(pack)
  print("Packs subfolders are identical!\n")
  
  renameIconsWithSpacesInTheirNames(pack)
  print("Renamed all icons with spaces in their names!\n")
  # exit()
  
  for subfolder in pack["subfolders"]:
    print(f"# {pack["foldername"]}:")
    print(f"## {subfolder}")
    print("")
    
    path = os.path.join(pack["foldername"], subfolder)
    icons = getAllIconsInFolder(path)

    groupedIcons = groupIconsByName(icons)

    for icon_name, icons_grouped in groupedIcons.items():
      print(icon_name, len(icons_grouped))
      # print(icons_grouped)

      for idx, i in enumerate(icons_grouped):
        if i["icon_num"] == "":
          nextInt = getNextGroupNumFromGroupedIcons(icons_grouped)
          newFilename = f"{i["filnameSansExt"]}-{nextInt}{i["ext"]}"
          print(f"Renamed {i["filename"]} to {newFilename}")
          
          fullPath = os.path.join(os.getcwd(), BASE_PATH, path, FILE_TYPE, i["filename"])
          fullPathNew = os.path.join(os.getcwd(), BASE_PATH, path, FILE_TYPE, newFilename)
          os.rename(fullPath, fullPathNew)

          icons_grouped[idx] = {
            "filename": newFilename,
            "filnameSansExt": pathlib.Path(newFilename).stem,
            "ext": pathlib.Path(newFilename).suffix,
            "icon_name": i["icon_name"],
            "icon_num": nextInt,
          }
        
      nextInt = getNextGroupNumFromGroupedIcons(icons_grouped)
      if nextInt != (len(icons_grouped) + 1):
        raise Exception(f"Icon group {icons_grouped[0]["icon_name"]} seems to have wonky numbering")

      print("")
    print("")