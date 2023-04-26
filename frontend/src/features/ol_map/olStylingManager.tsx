import { default as OLFeature } from "ol/Feature";
import { Icon } from "ol/style";
import Style from "ol/style/Style";
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
  getFontAwesomeIconForSymbolForOpenLayers,
  getSymbolFromSchemaSymbologyGroup,
} from "../symbology/symbologyHelpers";

export const getIconForSymbologyConfig = (
  olFeature: OLFeature,
  symbologyConfig: Partial<SymbologyProps>
) => {
  const icon = getFontAwesomeIconForSymbolForOpenLayers(symbologyConfig);

  if (icon === null) {
    return null;
  }

  return new Style({
    image: new Icon({
      src: `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${renderToString(
        icon
      )}`,
      // @NOTE: This is doable, we'd "just" need to inject and translate the styling onto the raw SVG element
      // src: `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${
      //   iconObj.svg[Object.keys(iconObj.svg)[0]].raw
      //   }`,
    }),
  });
};

export const olStyleFunction = (
  olFeature: OLFeature,
  resolution: number,
  defaultMapSymbology: SymbologyProps | null,
  featureSchemas: FeatureSchema[]
) => {
  const isDebugging = (feature: Feature) => feature.id === 1960000000;

  // Note this isn't strictly speaking one of our Features, because we don't have our 'geom' field (but we don't need it, so...)
  // @TODO Build the feature from the untyped props from scratch (so we can detect anything missing) or find a way to make OL geometry TypeScript typed.
  const feature = olFeature.getProperties() as Feature;

  if (isDebugging(feature)) {
    console.log("feature", feature);
  }

  let symbologyConfig = getAppDefaultSymbologyConfig();
  symbologyConfig = { ...symbologyConfig, ...defaultMapSymbology };

  const schema = getSchemaForFeature(feature, featureSchemas);

  if (isDebugging(feature)) {
    console.log("schema", schema);
  }

  if (schema !== undefined) {
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
          // NOTE: These aren't strictly speaking SymbologyValue entities because they contain non-symbology fields (e.g. the name of the symbol that appears in the schema)

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
      });
  }

  if (isDebugging(feature)) {
    console.log("symbologyConfig", symbologyConfig);
  }

  return getIconForSymbologyConfig(
    olFeature,
    symbologyConfig as Partial<SymbologyProps>
  );
};
