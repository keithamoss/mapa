import { IconName } from "@fortawesome/fontawesome-svg-core";
import categories from "./categories.json";
import icons from "./icons.json";

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
  | "hands-asl-interpreting"
  | "connectivity"
  | "construction"
  | "design"
  | "highlighter"
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
  | "heart"
  | "spinners"
  | "sports-fitness"
  | "text-formatting"
  | "i-cursor"
  | "time"
  | "toggle"
  | "transportation"
  | "travel-hotel"
  | "users-people"
  | "weather"
  | "writing";

export type IFontAwesomeCategories = {
  [key in FontAwesomeCategory]: {
    icons: IconName[];
    label: string;
  };
};

export type MyType = typeof categories;

export const getCategories = () => categories as IFontAwesomeCategories;

export type FontAwesomeStyle = "solid" | "regular" | "brands";

export interface IFontAwesomeIcon {
  changes: string[];
  ligatures: string[];
  search: {
    terms: string[];
  };
  styles: FontAwesomeStyle[];
  unicode: string;
  label: string;
  name: IconName;
  voted: boolean;
  svg: {
    [key: string]: {
      last_modified: number;
      raw: string;
      viewBox: [number, number, number, number];
      width: number;
      height: number;
      path: string;
    };
  };
  free: FontAwesomeStyle[];
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

export const getFirstCategoryForIcon = (iconName: string) => {
  const categories = getCategories();

  for (const [categoryName, category] of Object.entries(categories)) {
    if (category.icons.includes(iconName as IconName) === true) {
      return {
        name: categoryName,
        label: category.label,
      };
    }
  }

  return null;
};

export const getIconByNameWithFirstCategory = (iconName: string) => {
  const icons = getIcons();
  const category = getFirstCategoryForIcon(iconName);

  if (category !== null) {
    return {
      icon: {
        ...icons[iconName],
        name: iconName as IconName,
      },
      category,
    };
  }

  return null;
};

export const mapCategoriesToIcons = () => {
  const categories = getCategories();
  const iconsWithCategories: any = {};

  for (const [categoryName, category] of Object.entries(categories)) {
    category.icons.forEach((iconName) => {
      if (iconsWithCategories[iconName] === undefined) {
        iconsWithCategories[iconName] = [];
      }

      iconsWithCategories[iconName].push(category.label);
    });
  }

  return iconsWithCategories;
};

export const getIconsSortedByCategory = () => {
  const categories = getCategories();
  const iconsByCategory: IFontAwesomeIconsByCategory[] = [];

  for (const [categoryName, category] of Object.entries(categories)) {
    category.icons.forEach((iconName) => {
      const icon = getIconByName(iconName);

      if (icon !== null) {
        iconsByCategory.push({
          icon,
          category: {
            name: categoryName,
            label: category.label,
          },
        });
      }
    });
  }

  return iconsByCategory;
};
