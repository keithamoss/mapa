pack_discard_list = ["fruits2", "fruits6", "vegetables1", "vegetables2", "vegetables5", "fruitsandveggies2", "fruitsandveggies3", "fruitsandveggies4", "fruitsandveggies6", "assortedfood1", "assortedfood2", "assortedfood3", "assortedfood4"]
icon_retain_list = {"fruits6": ["saturn-peach", "redcurrant", "jujube", "pitaya", "fuzzy-kiwi", "golden-kiwi"], "vegetables1": ["macadamia"], "vegetables5": ["hibiscus"], "vegetables2": ["kohlrabi"]}

def get_icon_name(icon_id):
  icon_name = icon_id[0:icon_id.rfind("-")]
  if "-1" in icon_name:
    icon_name = icon_name.replace("-1", "")
  elif "-2" in icon_name:
    icon_name = icon_name.replace("-2", "")
  elif "-3" in icon_name:
    icon_name = icon_name.replace("-3", "")
  elif "-4" in icon_name:
    icon_name = icon_name.replace("-4", "")
  
  return icon_name