import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { maxZoomLevel, minZoomLevel } from '../../features/maps/mapStartingLocationEditorHelpers';
import { MapModifiableProps } from '../services/maps';
import { symbologyFormValidationSchema } from './symbologyForm';
import { positiveFloatOptional } from './yupValidation';

export const mapFormValidationSchema: ObjectSchema<MapModifiableProps> = yup
	.object({
		name: yup.string().required(),
		default_symbology: symbologyFormValidationSchema(false, false),
		hero_icon: symbologyFormValidationSchema(false, false),
		available_schema_ids: yup.array().ensure().required(),
		starting_location: yup
			.object({
				centre: yup
					.array()
					.test('two-numbers-or-undefined', 'The centre coordinate looks...wrong', (value) =>
						value !== undefined ? !value.some(isNaN) && value.length === 2 : true,
					),
				zoom: positiveFloatOptional
					.min(minZoomLevel, `Must be ${minZoomLevel} or larger`)
					.max(maxZoomLevel, `Must be ${maxZoomLevel} or smaller`),
			})
			.required(),
	})
	.required();
