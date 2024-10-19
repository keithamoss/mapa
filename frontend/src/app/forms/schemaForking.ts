import * as yup from 'yup';
import type { ObjectSchema } from 'yup';
import type { FeatureSchemaForkingSchemaModifiableProps } from '../services/schemas';

export const forkingSchemaFormValidationSchema: ObjectSchema<FeatureSchemaForkingSchemaModifiableProps> = yup
	.object({
		name: yup.string().required(),
	})
	.required();
