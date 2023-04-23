import * as yup from "yup";
import { ObjectSchema } from "yup";
import { FeatureSchemaSymbologyGroupModifiableProps } from "../services/schemas";

export const symbologyGroupFormValidationSchema: ObjectSchema<FeatureSchemaSymbologyGroupModifiableProps> =
  yup
    .object({
      name: yup.string().required(),
    })
    .required();
