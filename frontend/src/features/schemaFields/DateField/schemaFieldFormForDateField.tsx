import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';

import {
	Button,
	Checkbox,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../../app/forms/formUtils';
import { schemaDateFieldFormValidationSchema } from '../../../app/forms/schemaFieldsForms';
import { getStringOrEmptyStringForSchemasFieldsFormField } from '../../../app/forms/schemaForm';
import {
	FeatureSchemaFieldDefinitionDateField,
	FeatureSchemaFieldDefinitionDateFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';

interface Props {
	field: FeatureSchemaFieldDefinitionDateField | undefined;
	onDone: (fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection) => void;
	onCancel: () => void;
}

function SchemaFieldFormForDateField(props: Props) {
	const { field, onDone, onCancel } = props;

	const defaultValues = {
		name: getStringOrEmptyStringForSchemasFieldsFormField(field, 'name'),
		default_value: getStringOrEmptyStringForSchemasFieldsFormField(field, 'default_value'),
		required_field: field?.required_field || false,
	};

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaFieldDefinitionDateFieldFormModifiableProps>({
		resolver: yupResolver(schemaDateFieldFormValidationSchema),
		defaultValues,
	});

	const onDoneWithForm: SubmitHandler<FeatureSchemaFieldDefinitionDateFieldFormModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data);
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	return (
		<DialogWithTransition onClose={onCancel} dialogProps={{ fullScreen: false, fullWidth: true }}>
			<DialogTitle>Date Field</DialogTitle>
			<DialogContent>
				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<FormControl fullWidth={true} sx={{ mb: 3, mt: 1 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => <TextField {...field} required={true} label="Field label" />}
							/>
						</FormGroup>

						{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 1, mt: 1 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="default_value"
								control={control}
								render={({ field }) => (
									<DatePicker
										// If we are editing a saved field, we need to parse the ISO8601 date string into
										// a DayJS object.
										{...{
											...field,
											value: field.value != '' && typeof field.value === 'string' ? dayjs(field.value) : null,
										}}
										label="Default value"
										format={'DD/MM/YYYY'}
										slotProps={{
											textField: { helperText: "Will be used if you don't enter anything when creating a feature" },
											field: { clearable: true },
											actionBar: {
												// https://mui.com/x/api/date-pickers/pickers-action-bar/#PickersActionBar-prop-actions
												actions: ['clear', 'cancel', 'accept'],
											},
										}}
									/>
								)}
							/>
						</FormGroup>

						{errors.default_value && <FormHelperText error>{errors.default_value.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="required_field"
								control={control}
								defaultValue={defaultValues.required_field}
								render={({ field }) => (
									<FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Required field?" />
								)}
							/>
						</FormGroup>

						{errors.required_field && <FormHelperText error>{errors.required_field.message}</FormHelperText>}
					</FormControl>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onClickSave}>Save</Button>
			</DialogActions>
		</DialogWithTransition>
	);
}

export default SchemaFieldFormForDateField;
