import {
  FeatureSchema,
  FeatureSchemaSymbology,
  FeatureSchemaSymbologyGroup,
  FeatureSchemaSymbologySymbolsValue,
  SymbologyProps,
} from "../../app/services/schemas";

import { IconFamily, IconStyle } from "@fortawesome/fontawesome-svg-core";
import { hextoRGBACSS } from "../../app/colourUtils";
import { getIconByName, getIconSVG } from "./font-awesome/fontAwesome";

export const defaultSymbolIcon = "location-question";
export const defaultSymbolIconFamily = "classic";
export const defaultSymbolIconStyle = "solid";
export const defaultSymbolColour = "#183153";
export const defaultSymbolSecondaryColour = "#A6A6A6";
export const defaultSymbolSize = 15;
export const defaultSymbolSizeForFormFields = 15;
// <input type="color" /> doesn't support opacity, so provide pure white for the form and very opaque black for the map
export const defaultSymbolFillColour = "#FFFFFF03"; // So the whole icon is draggable in OL
// export const defaultSymbolFillColourForSymbologyForm = "#FFFFFF"; // So the whole icon is draggable in OL
export const defaultSymbolRotation = 0;
export const defaultSymbolOpacity = 1;
export const defaultSymbolSecondaryOpacity = 0.4;

export const defaultSymbologyGroupId = 1;

export interface FontAwesomeIconSVGProps {
  width: number;
  height: number;
  rotation: number;
  colour: string;
  secondaryColour: string;
  secondaryOpacity: number;
  backgroundColour: string;
}

export const getAppDefaultSymbologyConfig = () =>
  ({
    icon: defaultSymbolIcon,
    icon_family: defaultSymbolIconFamily,
    icon_style: defaultSymbolIconStyle,
    size: defaultSymbolSize,
    rotation: defaultSymbolRotation,
    colour: defaultSymbolColour,
    opacity: defaultSymbolOpacity,
    secondary_colour: defaultSymbolSecondaryColour,
    secondary_opacity: defaultSymbolSecondaryOpacity,
  } as SymbologyProps);

export const getFontAwesomeIconFromLibrary = (
  iconProps: FontAwesomeIconSVGProps,
  iconName: string,
  iconFamily?: IconFamily,
  iconStyle?: IconStyle
) => {
  const icon = getIconByName(iconName);

  if (icon === null) {
    return null;
  }

  let svg = getIconSVG(icon, iconFamily, iconStyle);

  svg = svg
    .replace(
      "<svg",
      `<svg aria-hidden="true" focusable="false" role="img" style="background-color: ${iconProps.backgroundColour}; transform: rotate(${iconProps.rotation}deg);" color="${iconProps.colour}" width="${iconProps.width}" height="${iconProps.height}"`
    )
    .replace("<path", '<path fill="currentColor"');

  if (iconFamily === "duotone") {
    svg = svg
      .replace(
        '<path class="fa-secondary"',
        `<path class="fa-secondary" fill="${iconProps.secondaryColour}"`
      )
      .replace(
        ".fa-secondary{opacity:.4}",
        `.fa-secondary{opacity:${iconProps.secondaryOpacity}}`
      );
  }

  return svg;
};

export const getFontAwesomeIconProps = (
  symbol: Partial<SymbologyProps>
): FontAwesomeIconSVGProps => {
  return {
    width: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
    height: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
    rotation: symbol?.rotation || defaultSymbolRotation,
    colour: hextoRGBACSS(
      symbol?.colour || defaultSymbolColour,
      symbol?.opacity || defaultSymbolOpacity
    ),
    secondaryColour: hextoRGBACSS(
      symbol?.secondary_colour || defaultSymbolSecondaryColour
    ),
    secondaryOpacity:
      symbol?.secondary_opacity || defaultSymbolSecondaryOpacity, // Opacity is taken care of on colour
    backgroundColour: hextoRGBACSS(defaultSymbolFillColour), // Ensure transparent areas of the icon are draggable
  };
};

export const getFontAwesomeIconForSymbolAsSVGString = (
  symbol: Partial<SymbologyProps>,
  propOverrides?: Partial<SymbologyProps>
) => {
  const { icon, icon_family, icon_style, ...props } = symbol;

  if (icon === undefined) {
    return null;
  }

  const local_symbol = {
    ...props,
    ...propOverrides,
  };

  return getFontAwesomeIconFromLibrary(
    getFontAwesomeIconProps(local_symbol),
    icon,
    icon_family as IconFamily,
    icon_style as IconStyle
  );
};

export const getFontAwesomeIconFromLibraryAsSVGImage = (
  iconName: string,
  iconFamily?: string,
  iconStyle?: string,
  propOverrides?: Partial<SymbologyProps>
) => (
  <img
    alt={iconName}
    src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
      getFontAwesomeIconProps(propOverrides || {}),
      iconName,
      iconFamily as IconFamily,
      iconStyle as IconStyle
    )}`}
  />
);

export const getFontAwesomeIconForSymbolPreview = (
  symbol: Partial<SymbologyProps>,
  propOverrides?: Partial<SymbologyProps>
) => {
  const { icon, icon_family, icon_style, ...props } = symbol;

  if (icon === undefined) {
    return null;
  }

  const local_symbol = {
    ...props,
    ...propOverrides,
  };

  const svg = getFontAwesomeIconFromLibrary(
    getFontAwesomeIconProps(local_symbol),
    icon,
    icon_family as IconFamily,
    icon_style as IconStyle
  );

  if (svg === null) {
    return null;
  }

  return <img alt={icon} src={`data:image/svg+xml;utf8,${svg}`} />;
};

export const getSymbolGroups = (symbology: FeatureSchemaSymbology) =>
  Object.values(symbology.groups) as FeatureSchemaSymbologyGroup[];

export const getSymbolsForGroup = (
  groupId: number,
  symbology: FeatureSchemaSymbology
) =>
  Object.values(symbology.symbols).filter(
    (s) => s.group_id === groupId
  ) as FeatureSchemaSymbologySymbolsValue[];

export const getSymbologyGroupById = (
  groupId: number,
  symbology: FeatureSchemaSymbology
) => {
  return symbology.groups.find((g) => g.id === groupId) || null;
};

export const getNextSymbologyGroupId = (symbology: FeatureSchemaSymbology) => {
  if (symbology.groups.length === 0) {
    return 1;
  }
  return Math.max(...symbology.groups.map((group) => group.id)) + 1;
};

export const getNextSymbologySymbolId = (symbology: FeatureSchemaSymbology) => {
  if (symbology.symbols.length === 0) {
    return 1;
  }
  return Math.max(...symbology.symbols.map((symbol) => symbol.id)) + 1;
};

export const addNewSymbologyGroup = (
  groupName: string,
  symbology: FeatureSchemaSymbology
) => {
  const nextId = getNextSymbologyGroupId(symbology);
  const local_symbology: FeatureSchemaSymbology = {
    ...symbology,
    groups: [
      ...symbology.groups,
      {
        id: nextId,
        name: groupName,
      },
    ],
  };
  return {
    id: nextId,
    symbology: local_symbology,
  };
};

export const editSymbologyGroup = (
  groupId: number,
  groupName: string,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = { ...symbology };

  const groupIdx = symbology.groups.findIndex(
    (symbologyGroup) => symbologyGroup.id === groupId
  );

  if (groupIdx !== -1 && groupIdx in local_symbology.groups) {
    local_symbology.groups[groupIdx] = {
      ...local_symbology.groups[groupIdx],
      name: groupName,
    };
  }

  return local_symbology;
};

export const deleteSymbologyGroup = (
  groupId: number,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = { ...symbology };

  if (getSymbolsForGroup(groupId, symbology).length === 0) {
    local_symbology.groups = local_symbology.groups.filter(
      (g) => g.id !== groupId
    );
  }

  return local_symbology;
};

export const addSymbolToGroup = (
  symbol: SymbologyProps,
  symbology: FeatureSchemaSymbology,
  groupId: number
): [FeatureSchemaSymbology, number] => {
  const newSymbolId = getNextSymbologySymbolId(symbology);
  return [
    {
      ...symbology,
      symbols: [
        ...symbology.symbols,
        {
          id: newSymbolId,
          group_id: groupId,
          props: symbol,
          favourited_map_ids: [],
        },
      ],
    },
    newSymbolId,
  ];
};

export const modifySymbolInGroup = (
  symbol: FeatureSchemaSymbologySymbolsValue,
  symbology: FeatureSchemaSymbology
) => {
  const symbolIdx = symbology.symbols.findIndex((s) => s.id === symbol.id);

  if (symbolIdx !== -1 && symbolIdx in symbology.symbols) {
    return {
      ...symbology,
      symbols: symbology.symbols.map((s, idx) =>
        idx === symbolIdx ? symbol : s
      ),
    };
  }

  return symbology;
};

export const moveSymbolsToGroup = (
  symbolIds: number[],
  groupId: number,
  symbology: FeatureSchemaSymbology
) => ({
  ...symbology,
  symbols: symbology.symbols.map((symbol) =>
    symbolIds.includes(symbol.id) === true
      ? { ...symbol, group_id: groupId }
      : symbol
  ),
});

// export const modifySymbolProps = (
//   symbol: SymbologyProps,
//   symbology: FeatureSchemaSymbology,
//   symbolId: number
// ) => {
//   const local_symbology = { ...symbology };

//   const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

//   if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
//     local_symbology.symbols[symbolIdx] = {
//       ...local_symbology.symbols[symbolIdx],
//       props: symbol,
//     };
//   }

//   return local_symbology;
// };

export const removeSymbol = (
  symbolId: number,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = {
    ...symbology,
    symbols: symbology.symbols.filter((s) => s.id !== symbolId),
  };
  return local_symbology;
};

export const favouriteSymbolForMap = (
  symbolId: number,
  mapId: number,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = { ...symbology };

  const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

  if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
    local_symbology.symbols[symbolIdx] = {
      ...local_symbology.symbols[symbolIdx],
      favourited_map_ids: [
        ...local_symbology.symbols[symbolIdx].favourited_map_ids,
        ...(local_symbology.symbols[symbolIdx].favourited_map_ids.includes(
          mapId
        ) === false
          ? [mapId]
          : []),
      ],
    };
  }

  return local_symbology;
};

export const unfavouriteSymbolForMap = (
  symbolId: number,
  mapId: number,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = { ...symbology };

  const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

  if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
    local_symbology.symbols[symbolIdx] = {
      ...local_symbology.symbols[symbolIdx],
      favourited_map_ids: local_symbology.symbols[
        symbolIdx
      ].favourited_map_ids.filter((id) => id !== mapId),
    };
  }

  return local_symbology;
};

export const getSymbolFromSchemaSymbology = (
  symbolId: number,
  symbology: FeatureSchemaSymbology
) => symbology.symbols.find((s) => s.id === symbolId);

export const getSymbolNameBySymbolId = (
  symbolId: number,
  schema: FeatureSchema
) => {
  const symbol = getSymbolFromSchemaSymbology(symbolId, schema.symbology);

  return symbol !== undefined ? symbol.props.name : null;
};
