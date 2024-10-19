import { yupResolver } from '@hookform/resolvers/yup';
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
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../../app/forms/formUtils';
import { schemaBooleanFieldFormValidationSchema } from '../../../app/forms/schemaFieldsForms';
import { getStringOrEmptyStringForSchemasFieldsFormField } from '../../../app/forms/schemaForm';
import type {
	FeatureSchemaFieldDefinitionBooleanField,
	FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';

interface Props {
	field: FeatureSchemaFieldDefinitionBooleanField | undefined;
	onDone: (fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection) => void;
	onCancel: () => void;
}

function SchemaFieldFormForBooleanField(props: Props) {
	const { field, onDone, onCancel } = props;

	const defaultValues = {
		name: getStringOrEmptyStringForSchemasFieldsFormField(field, 'name'),
		default_value: field?.default_value || false,
	};

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps>({
		resolver: yupResolver(schemaBooleanFieldFormValidationSchema),
		defaultValues,
	});

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onDoneWithForm: SubmitHandler<FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data);
		}
	};

	return (
		<DialogWithTransition onClose={onCancel} dialogProps={{ fullScreen: false, fullWidth: true }}>
			<DialogTitle>Boolean Field</DialogTitle>
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

					<FormControl fullWidth={true} component="fieldset" variant="outlined">
						<FormGroup>
							<FormControlLabel
								control={
									<Controller
										name="default_value"
										control={control}
										defaultValue={defaultValues.default_value}
										render={({ field }) => <Checkbox {...field} checked={field.value} />}
									/>
								}
								label="Default value"
							/>

							<FormHelperText>Will be used if you don&apos;t enter anything when creating a feature</FormHelperText>
						</FormGroup>

						{errors.default_value && <FormHelperText error>{errors.default_value.message}</FormHelperText>}
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

export default SchemaFieldFormForBooleanField;
