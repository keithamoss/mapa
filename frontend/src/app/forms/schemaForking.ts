import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { FeatureSchemaForkingSchemaModifiableProps } from '../services/schemas';

export const forkingSchemaFormValidationSchema: ObjectSchema<FeatureSchemaForkingSchemaModifiableProps> = yup
	.object({
		name: yup.string().required(),
	})
	.required();
