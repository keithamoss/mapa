import MiniSearch from "minisearch";

import {
  IconFamily,
  IconName,
  IconStyle,
} from "@fortawesome/fontawesome-svg-core";
import { upperFirst } from "lodash-es";
import {
  defaultSymbolIconFamily,
  defaultSymbolIconStyle,
} from "../symbologyHelpers";

import categories from "./pro/categories-processed.json";
import icons from "./pro/icon-families-processed.json";

export type FontAwesomeCategory =
  | "accessibility"
  | "alert"
  | "alphabet"
  | "animals"
  | "arrows"
  | "astronomy"
  | "automotive"
  | "buildings"
  | "business"
  | "camping"
  | "charity"
  | "charts-diagrams"
  | "childhood"
  | "clothing-fashion"
  | "coding"
  | "communication"
  | "connectivity"
  | "construction"
  | "design"
  | "devices-hardware"
  | "disaster"
  | "editing"
  | "education"
  | "emoji"
  | "energy"
  | "files"
  | "film-video"
  | "food-beverage"
  | "fruits-vegetables"
  | "gaming"
  | "gender"
  | "halloween"
  | "hands"
  | "holidays"
  | "household"
  | "humanitarian"
  | "logistics"
  | "maps"
  | "maritime"
  | "marketing"
  | "mathematics"
  | "media-playback"
  | "medical-health"
  | "money"
  | "moving"
  | "music-audio"
  | "nature"
  | "numbers"
  | "photos-images"
  | "political"
  | "punctuation-symbols"
  | "religion"
  | "science"
  | "science-fiction"
  | "security"
  | "shapes"
  | "shopping"
  | "social"
  | "spinners"
  | "sports-fitness"
  | "text-formatting"
  | "time"
  | "toggle"
  | "transportation"
  | "travel-hotel"
  | "users-people"
  | "weather"
  | "writing";

export type IFontAwesomeCategories = {
  [key in FontAwesomeCategory]: {
    name: FontAwesomeCategory;
    label: string;
    hero_icon: string;
    icons: IconName[];
  };
};

export const getCategories = () => categories as IFontAwesomeCategories;

export const getCategoryByName = (categoryName: string) => {
  const categories = getCategories();

  return categoryName in categories
    ? categories[categoryName as FontAwesomeCategory]
    : null;
};

export const getCategoryLabelByName = (categoryName: string) => {
  const category = getCategoryByName(categoryName);
  return category !== null ? category.label : null;
};

export interface IconFamilyStyle {
  family: IconFamily;
  style: IconStyle;
}

export interface IFontAwesomeIcon {
  name: IconName;
  label: string;
  categories: string[];
  search: {
    terms: string[];
  };
  svgs: {
    [key in IconFamily]: {
      [key in IconStyle]: string;
    };
  };
  familyStyles: IconFamilyStyle[];
}

export interface IFontAwesomeIcons {
  [key: string]: IFontAwesomeIcon;
}

export interface IFontAwesomeIconsByCategory {
  icon: IFontAwesomeIcon;
  category: {
    name: string;
    label: string;
  };
}

export const getIcons = (): IFontAwesomeIcons => icons as any;

export const getIconByName = (iconName: string) => {
  const icons = getIcons();
  if (iconName in icons) {
    return {
      ...icons[iconName],
      name: iconName,
    } as IFontAwesomeIcon;
  }
  return null;
};

export const getIconLabelByName = (iconName: string) => {
  const icon = getIconByName(iconName);
  return icon !== null ? icon.label : "Unnamed icon";
};

export const searchIcons = (searchTerm: string, categoryName?: string) => {
  const icons =
    categoryName === undefined
      ? getIcons()
      : getIconsForCategoryIndexedByIconName(categoryName);

  const miniSearch = new MiniSearch({
    idField: "name",
    fields: ["label", "search.terms", "categories"], // Fields to index for full-text search
    storeFields: ["name", "label", "search.terms", "categories"], // Fields to return with search results
    searchOptions: {
      boost: { name: 3, categories: 1.5 }, // Fields to boost in the results
      prefix: true, // Prefix search (so that 'moto' will match 'motorcycle')
      combineWith: "AND", // Combine terms with AND, not OR
      // Fuzzy search with a max edit distance of 0.2 * term length,
      // rounded to nearest integer. The mispelled 'ismael' will match 'ishmael'.
      // fuzzy: 0.2,
    },
    // Access nested fields (and regular top-level fields)
    extractField: (document, fieldName) =>
      fieldName.split(".").reduce((doc, key) => doc && doc[key], document),
  });

  // Index all documents
  miniSearch.addAll(Object.values(icons));

  return miniSearch.search(searchTerm);
};

export const getIconsForCategory = (categoryName: string) => {
  const categories = getCategories();
  const icons: IFontAwesomeIcon[] = [];

  if (categories[categoryName as FontAwesomeCategory] !== undefined) {
    categories[categoryName as FontAwesomeCategory].icons.forEach(
      (iconName: string) => {
        const icon = getIconByName(iconName);

        if (icon !== null) {
          icons.push(icon);
        }
      }
    );
  }

  return icons;
};

export const getIconsForCategoryIndexedByIconName = (categoryName: string) => {
  const icons: IFontAwesomeIcons = {};
  getIconsForCategory(categoryName).forEach(
    (icon) => (icons[icon.name] = icon)
  );
  return icons;
};

export const getAvailableStylesForIcon = (iconName?: string) =>
  iconName !== undefined ? getIconByName(iconName)?.familyStyles || [] : [];

export const getDefaultFamilyByIconName = (iconName: string) => {
  const icon = getIconByName(iconName);
  if (icon === null) {
    return defaultSymbolIconFamily;
  }

  return getDefaultFamilyForIcon(icon);
};

export const getDefaultFamilyForIcon = (icon: IFontAwesomeIcon) =>
  "classic" in icon.svgs
    ? "classic"
    : (Object.keys(icon.svgs)[0] as IconFamily);

export const getDefaultStyleByIconName = (iconName: string) => {
  const icon = getIconByName(iconName);
  if (icon === null) {
    return defaultSymbolIconStyle;
  }

  return getDefaultStyleForIcon(icon);
};

export const getDefaultStyleForIcon = (icon: IFontAwesomeIcon) =>
  "solid" in icon.svgs.classic
    ? "solid"
    : (Object.keys(icon.svgs.classic)[0] as IconStyle);

export const getIconSVG = (
  icon: IFontAwesomeIcon,
  iconFamily?: IconFamily,
  iconStyle?: IconStyle
) => {
  const localIconFamily: IconFamily =
    iconFamily !== undefined ? iconFamily : getDefaultFamilyForIcon(icon);

  const localIconStyle: IconStyle =
    iconStyle !== undefined ? iconStyle : getDefaultStyleForIcon(icon);

  return icon.svgs[localIconFamily][localIconStyle];
};

export const getIconFamilyAndStyleName = (
  icon_family: IconFamily,
  icon_style: IconStyle
) =>
  icon_family === "classic"
    ? upperFirst(icon_style)
    : `${upperFirst(icon_family)} ${upperFirst(icon_style)}`;
