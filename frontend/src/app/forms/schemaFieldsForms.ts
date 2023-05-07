import * as yup from "yup";
import { ObjectSchema } from "yup";
import {
  FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps,
  FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps,
  FeatureSchemaFieldDefinitionTextFieldFormModifiableProps,
} from "../services/schemas";
import { symbologyFormValidationSchema } from "./symbologyForm";

export const schemaTextFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionTextFieldFormModifiableProps> =
  yup
    .object({
      name: yup.string().required(),
      default_value: yup.string().ensure().defined(),
    })
    .required();

export const schemaBooleanFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps> =
  yup
    .object({
      name: yup.string().required(),
      default_value: yup.boolean().required(),
    })
    .required();

export const schemaSymbologyBooleanFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps> =
  yup
    .object({
      name: yup.string().required(),
      default_value: yup.boolean().required(),
      symbol: symbologyFormValidationSchema(false, false),
    })
    .required();
