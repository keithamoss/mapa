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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../../app/forms/formUtils';
import { schemaTextFieldFormValidationSchema } from '../../../app/forms/schemaFieldsForms';
import { getStringOrEmptyStringForSchemasFieldsFormField } from '../../../app/forms/schemaForm';
import {
	FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
	FeatureSchemaFieldDefinitionTextField,
	FeatureSchemaFieldDefinitionTextFieldFormModifiableProps,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';

interface Props {
	field: FeatureSchemaFieldDefinitionTextField | undefined;
	onDone: (fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection) => void;
	onCancel: () => void;
}

function SchemaFieldFormForTextField(props: Props) {
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
	} = useForm<FeatureSchemaFieldDefinitionTextFieldFormModifiableProps>({
		resolver: yupResolver(schemaTextFieldFormValidationSchema),
		defaultValues,
	});

	const onDoneWithForm: SubmitHandler<FeatureSchemaFieldDefinitionTextFieldFormModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data);
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	return (
		<DialogWithTransition onClose={onCancel} dialogProps={{ fullScreen: false, fullWidth: true }}>
			<DialogTitle>Text Field</DialogTitle>
			<DialogContent>
				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<FormControl fullWidth={true} sx={{ mb: 3, mt: 1 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => <TextFieldWithout1Password {...field} required={true} label="Field label" />}
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
									<TextField
										{...field}
										label="Default value"
										helperText="Will be used if you don't enter anything when creating a feature"
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

export default SchemaFieldFormForTextField;
