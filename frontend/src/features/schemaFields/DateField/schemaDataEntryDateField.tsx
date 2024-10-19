import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { type Control, Controller } from 'react-hook-form';
import { type FeatureSchemaFieldDefinitionDateField, FeatureSchemaFieldType } from '../../../app/services/schemas';
import type { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';

interface Props {
	control: Control<SchemaFormFieldsFormValues, unknown>;
	schemaField: FeatureSchemaFieldDefinitionDateField;
}

function SchemaDataEntryDateField(props: Props) {
	const { control, schemaField } = props;

	if (schemaField.type !== FeatureSchemaFieldType.DateField) {
		return null;
	}

	return (
		<Controller
			name={`schema_field_${schemaField.id}`}
			control={control}
			render={({ field /*, fieldState*/ }) => (
				<DatePicker
					// If we are editing a saved field, we need to parse the ISO8601 date string into
					// a DayJS object.
					{...{ ...field, value: field.value != '' && typeof field.value === 'string' ? dayjs(field.value) : null }}
					label={schemaField.name}
					format={'DD/MM/YYYY'}
					slotProps={{
						textField: {
							required: schemaField.required_field,
							helperText: schemaField.default_value !== '' ? `Default value: ${schemaField.default_value}` : undefined,
							// Normal margins, but we don't need top margins because every element above these provides their own bottom margins
							margin: 'normal',
							sx: { mt: 0, mb: 0 },
							// Turns out MUI DatePicker and react-hook-form don't play nicely.
							// There's quite a few posts about it - tried four different approaches from SO
							// posts before hitting on this one that actually works.
							// We eventually found this fix in:
							// https://github.com/orgs/react-hook-form/discussions/8993
							// https://codesandbox.io/s/polished-leftpad-4tn5gz?file=/src/App.tsx:1420-1667
							onBlur: field.onBlur,
							// These come from that fix, but I don't think they're needed?
							// error: !!fieldState?.error,
							// helperText: fieldState?.error?.message,
						},
						field: { clearable: true },
						actionBar: {
							// https://mui.com/x/api/date-pickers/pickers-action-bar/#PickersActionBar-prop-actions
							actions: ['clear', 'cancel', 'accept'],
						},
					}}
				/>
			)}
		/>
	);
}

export default SchemaDataEntryDateField;
