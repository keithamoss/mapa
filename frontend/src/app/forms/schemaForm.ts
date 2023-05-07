import * as yup from "yup";
import { FeatureSchemaFieldDefinitionCollection } from "../services/schemas";
import { symbologyFormValidationSchema } from "./symbologyForm";

export const schemaFormValidationSchema = yup
  .object({
    name: yup.string().required(),
    definition: yup.array().notRequired(),
    symbology: yup.object().required(),
    default_symbology: symbologyFormValidationSchema(false, false),
  })
  .required();

export const getStringOrEmptyStringForSchemasFieldsFormField = (
  schemaField:
    | Partial<FeatureSchemaFieldDefinitionCollection>
    | null
    | undefined,
  fieldName: keyof FeatureSchemaFieldDefinitionCollection
) =>
  schemaField === undefined ||
  schemaField === null ||
  schemaField[fieldName] === undefined
    ? ""
    : `${schemaField[fieldName]}`;

export const getNumberOrZeroForSchemasFieldsFormField = (
  schemaField:
    | Partial<FeatureSchemaFieldDefinitionCollection>
    | null
    | undefined,
  fieldName: keyof FeatureSchemaFieldDefinitionCollection
) =>
  schemaField === undefined ||
  schemaField === null ||
  schemaField[fieldName] === undefined
    ? 0
    : Number(schemaField[fieldName]);
