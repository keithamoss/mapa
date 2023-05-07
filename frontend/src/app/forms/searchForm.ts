import * as yup from "yup";

export const searchFormValidationSchema = yup
  .object({
    search_term: yup.string().required(),
    search_fields: yup.array().min(1).required(),
  })
  .required();
