import {
  FeatureSchemaSymbology,
  FeatureSchemaSymbologyGroup,
  FeatureSchemaSymbologySymbolsValue,
  SymbologyProps,
} from "../../app/services/schemas";

import { IconPrefix } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { getIconByName } from "./font-awesome/fontAwesome";

export const defaultSymbolIcon = "comments";
export const defaultSymbolColour = "#000000";
export const defaultSymbolSize = 15;
export const defaultSymbolSizeForFormFields = 20;
export const defaultSymbolStrokeWidth = 1.5;
// <input type="color" /> doesn't support opacity, so provide pure white for the form and very opaque black for the map
export const defaultSymbolFillColour = "#FFFFFF03"; // So the whole icon is draggable in OL
export const defaultSymbolFillColourForSymbologyForm = "#FFFFFF"; // So the whole icon is draggable in OL
export const defaultSymbolRotation = 0;
export const defaultSymbolOpacity = 1;

export const defaultSymbologyGroupId = 1;

// https://css-tricks.com/converting-color-spaces-in-javascript/
// https://stackoverflow.com/a/5624139
// export const hexToRGB = (hex: string) => {
//   // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
//   var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
//   hex = hex.replace(shorthandRegex, function (m, r, g, b) {
//     return r + r + g + g + b + b;
//   });

//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16),
//       }
//     : null;
// };

// export const hexToRGBCSS = (
//   hex: string | undefined,
//   default_colour = "rgba(0, 0, 0, 0.01)"
// ) => {
//   if (hex === undefined) {
//     return default_colour;
//   }
//   const rgb = hexToRGB(hex);
//   return rgb !== null ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : default_colour;
// };

export const hextoRGBACSS = (
  h: string | undefined,
  default_colour = "rgba(0, 0, 0, 0.01)"
) => {
  if (h === undefined) {
    return default_colour;
  }

  let r: any = 0,
    g: any = 0,
    b: any = 0,
    a: any = 255;

  // #FFF0
  if (h.length === 5) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];
    a = "0x" + h[4] + h[4];
    // #FFFFFF (default to opacity=1 aka 255)
  } else if (h.length === 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
    // #FFFFFF00
  } else if (h.length === 9) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
    a = "0x" + h[7] + h[8];
  }
  a = +(a / 255).toFixed(3);

  return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
};

export const getAppDefaultSymbologyConfig = () =>
  ({
    icon: defaultSymbolIcon,
    colour: defaultSymbolColour,
    size: defaultSymbolSize,
    stroke_width: defaultSymbolStrokeWidth,
    fill: defaultSymbolFillColour,
    rotation: defaultSymbolRotation,
    opacity: defaultSymbolOpacity,
  } as SymbologyProps);

const getFontAwesomeIconPrefixForStyle = (
  styleName: string
): IconPrefix | undefined => {
  if (styleName === "solid") {
    return "fas";
  } else if (styleName === "regular") {
    return "far";
  } else if (styleName === "light") {
    return "fal";
  } else if (styleName === "thin") {
    return "fat";
  } else if (styleName === "duotone") {
    return "fad";
  } else if (styleName === "brands") {
    return "fab";
  }
  // @TOOD From Pro
  // fak, fass, fasr, fasl
  return undefined;
};

export const getFontAwesomeIconFromLibrary = (
  iconName: string,
  iconStyle?: string,
  iconProps?: Partial<FontAwesomeIconProps>
) => {
  const icon = getIconByName(iconName);

  if (icon === null) {
    return null;
  }

  const faIconStyle = getFontAwesomeIconPrefixForStyle(
    iconStyle || icon.styles[0]
  );

  if (faIconStyle === undefined) {
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={[faIconStyle, icon.name]}
      {...getFontAwesomeIconPropsForSymbolPreview(
        getAppDefaultSymbologyConfig()
      )}
      {...iconProps}
    />
  );
};

export const getFontAwesomeIconPropsForOpenLayersSymbol = (
  symbol: Partial<SymbologyProps>
): Partial<FontAwesomeIconProps> => {
  return {
    // strokeWidth:
    //   symbol.stroke_width !== undefined
    //     ? symbol.stroke_width
    //     : defaultSymbolStrokeWidth,
    color:
      symbol.colour !== undefined
        ? hextoRGBACSS(symbol.colour)
        : hextoRGBACSS(defaultSymbolColour),
    // fill:
    //   symbol.fill !== undefined
    //     ? hextoRGBACSS(symbol.fill)
    //     : defaultSymbolFillColour,
    width: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
    height: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
    style: {
      opacity: symbol?.opacity || defaultSymbolOpacity,
      // Ensure transparent areas of the icon are draggable
      backgroundColor: hextoRGBACSS(defaultSymbolFillColour),
    },
    transform: { rotate: symbol.rotation || defaultSymbolRotation },
  };
};

export const getFontAwesomeIconPropsForSymbolPreview = (
  symbol: Partial<SymbologyProps>
): Partial<FontAwesomeIconProps> => {
  return {
    color: symbol?.colour,
    style: {
      fontSize: `${(symbol?.size || defaultSymbolSize) / 14}em`,
      opacity: symbol?.opacity || 1,
    },
    transform: { rotate: symbol?.rotation || 0 },
  };
};

export const getFontAwesomeIconForSymbolPreview = (
  symbol: Partial<SymbologyProps>,
  propOverrides?: Partial<SymbologyProps>
) => {
  const { icon, icon_style, ...props } = symbol;

  if (icon === undefined) {
    return null;
  }

  const local_symbol = {
    ...props,
    ...propOverrides,
  };

  return getFontAwesomeIconFromLibrary(
    icon,
    icon_style,
    getFontAwesomeIconPropsForSymbolPreview(local_symbol)
  );
};

export const getFontAwesomeIconForSymbolForOpenLayers = (
  symbol: Partial<SymbologyProps>
) => {
  const { icon, icon_style, ...props } = symbol;

  if (icon === undefined) {
    return null;
  }

  return getFontAwesomeIconFromLibrary(
    icon,
    icon_style,
    getFontAwesomeIconPropsForOpenLayersSymbol(props)
  );
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
  const local_symbology: FeatureSchemaSymbology = {
    ...symbology,
    groups: [
      ...symbology.groups,
      {
        id: getNextSymbologyGroupId(symbology),
        name: groupName,
      },
    ],
  };
  return local_symbology;
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
  const local_symbology: FeatureSchemaSymbology = { ...symbology };

  const symbolIdx = local_symbology.symbols.findIndex(
    (s) => s.id === symbol.id
  );

  if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
    local_symbology.symbols[symbolIdx] = symbol;
  }

  return local_symbology;
};

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

export const removeSymbolFromGroup = (
  symbolId: number,
  symbology: FeatureSchemaSymbology
) => {
  const local_symbology: FeatureSchemaSymbology = {
    ...symbology,
    symbols: symbology.symbols.filter((s) => s.id !== symbolId),
  };
  return local_symbology;
};

export const getSymbolFromSchemaSymbologyGroup = (
  symbolId: number,
  symbology: FeatureSchemaSymbology
) => symbology.symbols.find((s) => s.id === symbolId);
