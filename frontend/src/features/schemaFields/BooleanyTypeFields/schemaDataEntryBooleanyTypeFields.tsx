import { Checkbox, FormControlLabel, FormHelperText, Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { FeatureDataItem } from '../../../app/services/features';
import {
	FeatureSchemaFieldDefinitionBooleanField,
	FeatureSchemaFieldDefinitionSymbologyBoolean,
	FeatureSchemaFieldType,
} from '../../../app/services/schemas';
import { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';

interface Props {
	control: Control<SchemaFormFieldsFormValues, unknown>;
	schemaField: FeatureSchemaFieldDefinitionBooleanField | FeatureSchemaFieldDefinitionSymbologyBoolean;
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
					defaultValue={dataItem !== undefined ? (dataItem.value as boolean) : undefined}
					render={({ field }) => (
						<Checkbox {...field} checked={field.value !== undefined ? (field.value as boolean) : undefined} />
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
