import * as yup from 'yup';

export const searchLocationsFormValidationSchema = yup
	.object({
		search_term: yup.string().required(),
	})
	.required();
