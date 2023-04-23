import { Feature } from "../../app/services/features";
import {
  FeatureSchema,
  FeatureSchemaFieldDefinitionCollection,
} from "../../app/services/schemas";

export const getSchemaForFeature = (
  feature: Feature,
  schemas: FeatureSchema[]
) => schemas.find((schema) => schema.id === feature.schema_id);

export const isFieldDefinitionSymbology = (
  fieldDefinition: FeatureSchemaFieldDefinitionCollection
) => ["symbology_field_boolean"].includes(fieldDefinition.type);

export const getFieldFromSchemaDefinitionById = (
  schema: FeatureSchema,
  schemaFieldId: number
) => schema.definition.find((f) => f.id === schemaFieldId);

export const moveFieldUp = (
  fieldId: number,
  definition: FeatureSchemaFieldDefinitionCollection[]
) => {
  const fieldIdx = definition.findIndex((f) => f.id === fieldId);

  if (fieldIdx !== -1 && fieldIdx > 0) {
    const local_definition = [...(definition || [])];
    const field = local_definition.splice(fieldIdx, 1)[0];
    const toFieldIdx = fieldIdx - 1;

    local_definition.splice(toFieldIdx, 0, field);

    return local_definition;
  }

  return null;
};

export const moveFieldDown = (
  fieldId: number,
  definition: FeatureSchemaFieldDefinitionCollection[]
) => {
  const fieldIdx = definition.findIndex((f) => f.id === fieldId);

  if (fieldIdx !== -1 && fieldIdx < definition.length - 1) {
    const local_definition = [...(definition || [])];
    const field = local_definition.splice(fieldIdx, 1)[0];
    const toFieldIdx = fieldIdx + 1;

    local_definition.splice(toFieldIdx, 0, field);

    return local_definition;
  }

  return null;
};
