import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { FeatureSchemaFieldDefinitionTextField, FeatureSchemaFieldType } from '../../../app/services/schemas';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';
import { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';

interface Props {
	control: Control<SchemaFormFieldsFormValues, unknown>;
	schemaField: FeatureSchemaFieldDefinitionTextField;
	setValue: UseFormSetValue<SchemaFormFieldsFormValues>;
}

function SchemaDataEntryTextField(props: Props) {
	const { control, schemaField, setValue } = props;

	if (schemaField.type !== FeatureSchemaFieldType.TextField) {
		return null;
	}

	const onPasteFromClipboard = (pastedText: string) => {
		setValue(`schema_field_${schemaField.id}`, pastedText, { shouldDirty: true });
	};

	return (
		<Controller
			name={`schema_field_${schemaField.id}`}
			control={control}
			render={({ field }) => (
				<TextFieldWithPasteAdornment
					{...{ ...field, value: field.value !== undefined ? field.value : '' }}
					required={schemaField.required_field}
					label={schemaField.name}
					helperText={schemaField.default_value !== '' ? `Default value: ${schemaField.default_value}` : undefined}
					// Normal margins, but we don't need top margins because every element above these provides their own bottom margins
					margin="normal"
					sx={{ mt: 0, mb: 0 }}
					pastingDisabled={schemaField.allow_pasting !== true}
					onPasteFromClipboard={onPasteFromClipboard}
				/>
			)}
		/>
	);
}

export default SchemaDataEntryTextField;
