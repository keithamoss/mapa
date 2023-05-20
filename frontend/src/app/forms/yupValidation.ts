import * as yup from 'yup';

// export const stringOrUndefined = yup
//   .string()
//   // .transform(() => undefined)
//   .transform((_, val) => (val !== "" ? val : undefined))
//   .notRequired();

// export const colourOrUndefined = yup
//   .string()
//   .matches(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i)
//   .notRequired();

export const colourOptional = yup
	.string()
	.matches(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i)
	.optional();

// export const colourRequired = yup
//   .string()
//   .matches(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i)
//   .required();

// export const positiveIntegerOrUndefined = yup
//   .number()
//   .positive("Must be a positive number")
//   .integer("Must be a whole number")
//   // .transform(() => undefined)
//   .transform((_, val) => (val !== "" ? Number(val) : undefined))
//   .notRequired();

// export const positiveIntegerRequired = yup
//   .number()
//   .positive("Must be a positive number")
//   .integer("Must be a whole number")
//   .required();

export const positiveIntegerOptional = yup
	.number()
	.positive('Must be a positive number')
	.integer('Must be a whole number')
	.optional();

// export const positiveFloatOrUndefined = yup
//   .number()
//   .positive("Must be a positive number")
//   // .integer("Must be a whole number")
//   // .transform(() => undefined)
//   .transform((_, val) => (val !== "" ? Number(val) : undefined))
//   .notRequired();

// export const positiveFloatRequired = yup
//   .number()
//   .positive("Must be a positive number")
//   .required();

export const positiveFloatOptional = yup.number().positive('Must be a positive number').optional();
