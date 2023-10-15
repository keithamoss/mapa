import { TextField } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { FeatureSchemaFieldDefinitionNumberField, FeatureSchemaFieldType } from '../../../app/services/schemas';
import { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';

interface Props {
	control: Control<SchemaFormFieldsFormValues, unknown>;
	schemaField: FeatureSchemaFieldDefinitionNumberField;
}

function SchemaDataEntryNumberField(props: Props) {
	const { control, schemaField } = props;

	if (schemaField.type !== FeatureSchemaFieldType.NumberField) {
		return null;
	}

	return (
		<Controller
			name={`schema_field_${schemaField.id}`}
			control={control}
			render={({ field }) => (
				<TextField
					{...{ ...field, value: field.value !== undefined ? field.value : '' }}
					type="number"
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
					label={schemaField.name}
					helperText={
						schemaField.default_value !== undefined ? `Default value: ${schemaField.default_value}` : undefined
					}
					// Normal margins, but we don't need top margins because every element above these provides their own bottom margins
					margin="normal"
					sx={{ mt: 0, mb: 0 }}
				/>
			)}
		/>
	);
}

export default SchemaDataEntryNumberField;
