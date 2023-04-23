import * as yup from "yup";
import { ObjectSchema } from "yup";
import { MapModifiableProps } from "../services/maps";
import { symbologyFormValidationSchema } from "./symbologyForm";

export const mapFormValidationSchema: ObjectSchema<MapModifiableProps> = yup
  .object({
    name: yup.string().required(),
    default_symbology: symbologyFormValidationSchema(false, false),
  })
  .required();
