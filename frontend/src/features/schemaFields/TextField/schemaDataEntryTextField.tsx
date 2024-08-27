import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { FeatureSchemaFieldDefinitionTextField, FeatureSchemaFieldType } from '../../../app/services/schemas';
import { isClipboardApiSupported } from '../../../app/utils';
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

	const onPasteFromClipboard = async () => {
		try {
			const pasted = await navigator.clipboard.readText();
			setValue(`schema_field_${schemaField.id}`, pasted, { shouldDirty: true });
		} catch {
			/* empty */
		}
	};

	// This is here because the MUI example had it.
	// Ref: https://mui.com/material-ui/react-text-field/#input-adornments
	const handleMouseDownOnPasteFromClipboard = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<Controller
			name={`schema_field_${schemaField.id}`}
			control={control}
			render={({ field }) => (
				<TextField
					{...{ ...field, value: field.value !== undefined ? field.value : '' }}
					required={schemaField.required_field}
					label={schemaField.name}
					helperText={schemaField.default_value !== '' ? `Default value: ${schemaField.default_value}` : undefined}
					// Normal margins, but we don't need top margins because every element above these provides their own bottom margins
					margin="normal"
					sx={{ mt: 0, mb: 0 }}
					InputProps={{
						endAdornment:
							isClipboardApiSupported() === true ? (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={onPasteFromClipboard}
										onMouseDown={handleMouseDownOnPasteFromClipboard}
										edge="end"
									>
										<ContentPasteGoIcon />
									</IconButton>
								</InputAdornment>
							) : undefined,
					}}
				/>
			)}
		/>
	);
}

export default SchemaDataEntryTextField;
