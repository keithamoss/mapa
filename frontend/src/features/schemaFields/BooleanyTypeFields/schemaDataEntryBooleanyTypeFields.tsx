import { Checkbox, FormControlLabel, FormHelperText, Typography } from '@mui/material';
import { isBoolean } from 'lodash-es';
import { type Control, Controller } from 'react-hook-form';
import type { FeatureDataItem } from '../../../app/services/features';
import {
	type FeatureSchemaFieldDefinitionBooleanField,
	type FeatureSchemaFieldDefinitionSymbologyBooleanField,
	FeatureSchemaFieldType,
} from '../../../app/services/schemas';
import type { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';

interface Props {
	control: Control<SchemaFormFieldsFormValues, unknown>;
	schemaField: FeatureSchemaFieldDefinitionBooleanField | FeatureSchemaFieldDefinitionSymbologyBooleanField;
	dataItem: FeatureDataItem | undefined;
}

function SchemaDataEntryBooleanyTypeFields(props: Props) {
	const { control, schemaField, dataItem } = props;

	if (
		!(
			schemaField.type === FeatureSchemaFieldType.BooleanField ||
			schemaField.type === FeatureSchemaFieldType.SymbologyFieldBoolean
		)
	) {
		return null;
	}

	return (
		<FormControlLabel
			control={
				<Controller
					name={`schema_field_${schemaField.id}`}
					control={control}
					defaultValue={dataItem !== undefined ? (dataItem.value as boolean) : false}
					render={({ field }) => (
						<Checkbox {...field} checked={field.value !== undefined && isBoolean(field.value) ? field.value : false} />
					)}
				/>
			}
			label={
				<Typography variant="body1">
					{schemaField.name}
					<FormHelperText component="span">
						(Default: {schemaField.default_value === true ? 'Checked' : 'Unchecked'})
					</FormHelperText>
				</Typography>
			}
			sx={{ mt: -1, mb: 2 }}
		/>
	);
}

export default SchemaDataEntryBooleanyTypeFields;
