// import Internet from "iconoir/icons/internet.svg";
import { default as OLFeature } from "ol/Feature";
import { Icon } from "ol/style";
import Style from "ol/style/Style";
import React from "react";
import { renderToString } from "react-dom/server";

import { Feature, FeatureDataItem } from "../../app/services/features";

import {
  FeatureSchema,
  FeatureSchemaFieldDefinitionCollection,
  FeatureSchemaFieldType,
  SymbologyProps,
} from "../../app/services/schemas";
import {
  getFeatureDataItemForSchemaField,
  getSymbolValueForFeatureDataItem,
} from "../features/featureHelpers";
import {
  getSchemaForFeature,
  isFieldDefinitionSymbology,
} from "../schemas/schemaHelpers";
import {
  getAppDefaultSymbologyConfig,
  getIconForSymbolForOpenLayers,
  getSymbolFromSchemaSymbologyGroup,
} from "../symbology/symbologyHelpers";

// export const getAvailableIcons = () => [
//   "triangle",
//   "square",
//   "star",
//   "map_marker",
// ];

export const getIconForSymbologyConfig = (
  olFeature: OLFeature,
  symbologyConfig: Partial<SymbologyProps>
) => {
  const icon = getIconForSymbolForOpenLayers(symbologyConfig);
  if (icon === null) {
    return null;
  }

  return new Style({
    image: new Icon({
      // width: 50,
      // height: 50,
      scale:
        symbologyConfig.size !== undefined ? symbologyConfig.size / 10 : 1.5,
      // anchor: [0.5, 0.9],
      // anchorXUnits: "fraction",
      // anchorYUnits: "pixels",
      // displacement: ,
      rotation:
        symbologyConfig.rotation !== undefined ? symbologyConfig.rotation : 0, // radians
      opacity:
        symbologyConfig.opacity !== undefined ? symbologyConfig.opacity : 1,
      // src:
      //   "data:image/svg+xml;utf8," +
      //   '<svg style="color: rgb(0, 255, 0);" width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      //   '<path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
      //   '<path d="M13 2.04932C13 2.04932 16 5.99994 16 11.9999" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
      //   '<path d="M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
      //   '<path d="M2.62964 15.5H12" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
      //   '<path d="M2.62964 8.5H21.3704" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
      //   '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.8789 17.9174C22.3727 18.2211 22.3423 18.9604 21.8337 19.0181L19.2671 19.309L18.1159 21.6213C17.8878 22.0795 17.1827 21.8552 17.0661 21.2873L15.8108 15.1713C15.7123 14.6913 16.1437 14.3892 16.561 14.646L21.8789 17.9174Z" stroke="currentColor"  />' +
      //   "</svg>",
      // src:
      //   "data:image/svg+xml;utf8," +
      //   '<?xml version="1.0" encoding="UTF-8"?>' +
      //   '<svg width="500" height="500" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      //   " <g>" +
      //   '<path style="fill: red" d="m346.62 18.352c-94.633 0-171.36 76.703-171.36 171.38 0 21.336 4.0898 41.676 11.219 60.555h-0.027344s0.078125 0.21875 0.20312 0.65625l132.66 267.53c0.11328 0.027344 0.17969 0.074218 0.30078 0.10156 3.1992 10.566 12.918 18.301 24.551 18.301 11.504 0 21.125-7.5781 24.422-17.988 0.27344-0.125 0.49219-0.25781 0.76562-0.37891l137.32-267.56c7.2773-18.996 11.32-39.633 11.32-61.215 0-94.668-76.727-171.38-171.38-171.38zm0 200.25c-27.766 0-50.281-22.5-50.281-50.289 0-27.77 22.52-50.281 50.281-50.281 27.781 0 50.301 22.52 50.301 50.281-0.003906 27.793-22.52 50.289-50.301 50.289z"/>' +
      //   "</g>" +
      //   "</svg>",
      src: `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${renderToString(
        icon
      )}`,
    }),
  });

  // if (symbologyConfig.icon === "map_marker") {
  //   return new Style({
  //     image: new RegularShape({
  //       fill: new Fill({ color: symbologyConfig.colour }),
  //       // stroke: stroke,
  //       points: 3,
  //       radius: symbologyConfig.size,
  //       rotation: Math.PI / 4,
  //       angle: 0,
  //     }),
  //   });
  // } else if (symbologyConfig.icon === "square") {
  //   return new Style({
  //     image: new RegularShape({
  //       fill: new Fill({ color: symbologyConfig.colour }),
  //       // stroke: new Stroke({ color: "black", width: 2 }),
  //       points: 4,
  //       radius: symbologyConfig.size,
  //       angle: Math.PI / 4,
  //     }),
  //   });
  // } else if (symbologyConfig.icon === "star") {
  //   return new Style({
  //     image: new RegularShape({
  //       fill: new Fill({ color: symbologyConfig.colour }),
  //       // stroke: stroke,
  //       points: 5,
  //       radius: symbologyConfig.size,
  //       radius2: symbologyConfig.size / 2,
  //       angle: 0,
  //     }),
  //   });
  // } else if (symbologyConfig.icon === "triangle") {
  //   // fetch("internet.svg")
  //   //   .then((response) => {
  //   //     console.log(response);
  //   //     return response.text();
  //   //   })
  //   //   .then((svg) => {
  //   //     // console.log(svg);
  //   //     // <defs><style>svg{ color: red; }</style></defs>
  //   //     // const svgIcon = `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${svg}`;
  //   //     const svgIcon = `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${renderToString(
  //   //       <Internet />
  //   //     )}`;
  //   //     const icon = new Icon({
  //   //       anchor: [0.5, 0.9],
  //   //       width: 50,
  //   //       height: 50,
  //   //       // scale: 0.3,
  //   //       // color: "#FF0000",
  //   //       // anchorXUnits: "fraction",
  //   //       // anchorYUnits: "pixels",
  //   //       // displacement: ,
  //   //       src: svgIcon,
  //   //     });

  //   //     console.log("setStyle");
  //   //     olFeature.setStyle(
  //   //       new Style({
  //   //         image: icon,
  //   //       })
  //   //     );
  //   //   });
  //   // return null;

  //   return new Style({
  //     image: new Icon({
  //       // width: 50,
  //       // height: 50,
  //       scale: symbologyConfig.size / 10,
  //       // anchor: [0.5, 0.9],
  //       // anchorXUnits: "fraction",
  //       // anchorYUnits: "pixels",
  //       // displacement: ,
  //       // src:
  //       //   "data:image/svg+xml;utf8," +
  //       //   '<svg style="color: rgb(0, 255, 0);" width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  //       //   '<path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
  //       //   '<path d="M13 2.04932C13 2.04932 16 5.99994 16 11.9999" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
  //       //   '<path d="M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
  //       //   '<path d="M2.62964 15.5H12" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
  //       //   '<path d="M2.62964 8.5H21.3704" stroke="currentColor"   stroke-linecap="round" stroke-linejoin="round"/>' +
  //       //   '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.8789 17.9174C22.3727 18.2211 22.3423 18.9604 21.8337 19.0181L19.2671 19.309L18.1159 21.6213C17.8878 22.0795 17.1827 21.8552 17.0661 21.2873L15.8108 15.1713C15.7123 14.6913 16.1437 14.3892 16.561 14.646L21.8789 17.9174Z" stroke="currentColor"  />' +
  //       //   "</svg>",
  //       // src:
  //       //   "data:image/svg+xml;utf8," +
  //       //   '<?xml version="1.0" encoding="UTF-8"?>' +
  //       //   '<svg width="500" height="500" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
  //       //   " <g>" +
  //       //   '<path style="fill: red" d="m346.62 18.352c-94.633 0-171.36 76.703-171.36 171.38 0 21.336 4.0898 41.676 11.219 60.555h-0.027344s0.078125 0.21875 0.20312 0.65625l132.66 267.53c0.11328 0.027344 0.17969 0.074218 0.30078 0.10156 3.1992 10.566 12.918 18.301 24.551 18.301 11.504 0 21.125-7.5781 24.422-17.988 0.27344-0.125 0.49219-0.25781 0.76562-0.37891l137.32-267.56c7.2773-18.996 11.32-39.633 11.32-61.215 0-94.668-76.727-171.38-171.38-171.38zm0 200.25c-27.766 0-50.281-22.5-50.281-50.289 0-27.77 22.52-50.281 50.281-50.281 27.781 0 50.301 22.52 50.301 50.281-0.003906 27.793-22.52 50.289-50.301 50.289z"/>' +
  //       //   "</g>" +
  //       //   "</svg>",
  //       src: `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${renderToString(
  //         getIconForSymbol(symbologyConfig)
  //       )}`,
  //     }),
  //   });
  // }
};

export const olStyleFunction = (
  olFeature: OLFeature,
  resolution: number,
  defaultMapSymbology: SymbologyProps | null,
  featureSchemas: FeatureSchema[]
) => {
  // console.log("olStyleFunction");
  const isDebugging = (feature: Feature) => feature.id === 1960000000;

  // Note this isn't strictly speaking one of our Features, because we don't have our 'geom' field (but we don't need it, so...)
  // @TODO Build the feature from the untyped props from scratch (so we can detect anything missing) or find a way to make OL geometry TypeScript typed.
  const feature = olFeature.getProperties() as Feature;

  // console.log("feature", feature);

  if (isDebugging(feature)) {
    console.log("feature", feature);
  }

  let symbologyConfig = getAppDefaultSymbologyConfig();
  symbologyConfig = { ...symbologyConfig, ...defaultMapSymbology };
  // let symbologyConfig = defaultMapSymbology !== null ? defaultMapSymbology : getAppDefaultSymbologyConfig();

  const schema = getSchemaForFeature(feature, featureSchemas);

  if (isDebugging(feature)) {
    console.log("schema", schema);
  }

  if (schema !== undefined) {
    // console.log("schema", schema);

    if (schema.default_symbology !== null) {
      symbologyConfig = { ...symbologyConfig, ...schema.default_symbology };
    }

    // Add in any symbology config present in the schema symbology
    if (feature.symbol_id !== null) {
      const symbol = getSymbolFromSchemaSymbologyGroup(
        feature.symbol_id,
        schema.symbology
      );

      if (symbol !== undefined) {
        symbologyConfig = { ...symbologyConfig, ...symbol.props };
      }
    }

    // Add in any symbology config present in the schema data items (e.g. checkboxes modifying symbology)
    const isDataItemToBeUsed = (
      fieldDefinition: FeatureSchemaFieldDefinitionCollection,
      dataItem: FeatureDataItem | undefined
    ) => {
      if (dataItem !== undefined) {
        if (
          fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean
        ) {
          return dataItem.value; // the value set in the field will decide if this data item is to be used or not
        }
      }

      return false;
    };

    // Use the schema field order to loop through the field definitions
    // because feature data items don't have any inherent order
    schema.definition
      .filter(
        (fieldDefinition) =>
          isFieldDefinitionSymbology(fieldDefinition) === true
      )
      .forEach((fieldDefinition) => {
        if (isDebugging(feature)) {
          console.log("fieldDefinition", fieldDefinition);
        }

        const dataItem = getFeatureDataItemForSchemaField(
          fieldDefinition,
          feature
        );

        if (isDebugging(feature)) {
          console.log("dataItem", dataItem);
        }

        // The user has provided data for this field on the feature
        if (
          dataItem !== undefined &&
          isDataItemToBeUsed(fieldDefinition, dataItem)
        ) {
          const symbologyValue = getSymbolValueForFeatureDataItem(
            dataItem,
            fieldDefinition
          );

          if (isDebugging(feature)) {
            console.log("symbologyValue", symbologyValue);
          }
          // console.log("symbologyValue", symbologyValue);
          // NOTE: These aren't strictly speaking SymbologyValue entities because they contain non-symbology fields (e.g. the name of the symbol that appears in the schema)
          // console.log("symbologyValue", symbologyValue);

          symbologyConfig = { ...symbologyConfig, ...symbologyValue };

          // The user hasn't provided data for this field, but there may still be a default value
        } else {
          if (
            fieldDefinition.type ===
              FeatureSchemaFieldType.SymbologyFieldBoolean &&
            fieldDefinition.default_value === true
          ) {
            symbologyConfig = { ...symbologyConfig, ...fieldDefinition.symbol };
          }
        }

        // console.log("symbologyConfig", symbologyConfig);
      });

    // console.log("symbologyConfig", symbologyConfig);
  }
  if (isDebugging(feature)) {
    console.log("symbologyConfig", symbologyConfig);
  }

  // console.log("symbologyConfig", symbologyConfig);
  // if (isEmpty(symbologyConfig) === false) {
  return getIconForSymbologyConfig(
    olFeature,
    symbologyConfig as Partial<SymbologyProps>
  );
  // }
};

const foobar = () => <React.Fragment></React.Fragment>;
export default foobar;
