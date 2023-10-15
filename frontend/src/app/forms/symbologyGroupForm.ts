import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import {
	FeatureSchemaSymbologyGroupChooserForRearragingModifiableProps,
	FeatureSchemaSymbologyGroupModifiableProps,
} from '../services/schemas';

export const symbologyGroupFormValidationSchema: ObjectSchema<FeatureSchemaSymbologyGroupModifiableProps> = yup
	.object({
		name: yup.string().required(),
	})
	.required();

export const symbologyGroupFormValidationSchemaIDOnly: ObjectSchema<FeatureSchemaSymbologyGroupChooserForRearragingModifiableProps> =
	yup
		.object({
			id: yup.number().required(),
		})
		.required();
