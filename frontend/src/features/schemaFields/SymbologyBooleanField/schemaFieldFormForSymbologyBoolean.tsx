import { yupResolver } from '@hookform/resolvers/yup';
import TuneIcon from '@mui/icons-material/Tune';
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
	FormLabel,
	Typography,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../../app/forms/formUtils';
import { schemaSymbologyBooleanFieldFormValidationSchema } from '../../../app/forms/schemaFieldsForms';
import { getStringOrEmptyStringForSchemasFieldsFormField } from '../../../app/forms/schemaForm';
import {
	FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
	FeatureSchemaFieldDefinitionSymbologyBooleanField,
	FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps,
	SymbologyProps,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import SymbologyFieldEditor from '../../symbology/symbologyFieldEditor';

interface Props {
	field: Partial<FeatureSchemaFieldDefinitionSymbologyBooleanField> | undefined;
	onDone: (fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection) => void;
	onCancel: () => void;
}

function SchemaFieldFormForSymbologyBoolean(props: Props) {
	const { field, onDone, onCancel } = props;

	const [isSettingSymbol, setIsSettingSymbol] = useState(false);

	const onSetSymbolField = () => {
		setIsSettingSymbol(true);
	};
	const onCancelSettingSymbol = () => setIsSettingSymbol(false);

	const defaultValues = {
		name: getStringOrEmptyStringForSchemasFieldsFormField(field, 'name'),
		default_value: field?.default_value || false,
		symbol: field?.symbol,
	};

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps>({
		resolver: yupResolver(schemaSymbologyBooleanFieldFormValidationSchema),
		defaultValues,
	});

	const { symbol } = watch();

	const onDoneSettingSymbol = (symbol: SymbologyProps) => {
		setValue('symbol', symbol);
		setIsSettingSymbol(false);
	};

	const onDoneWithForm: SubmitHandler<FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data);
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onCancel} dialogProps={{ fullScreen: false, fullWidth: true }}>
				<DialogTitle>Boolean Symbology Field</DialogTitle>

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

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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

						<FormControl fullWidth={true} component="fieldset" variant="outlined">
							<FormLabel component="legend" sx={{ mb: 1 }}>
								Symbology
							</FormLabel>

							<FormGroup>
								<Typography variant="body2">
									This will be overwritten by any symbology set by fields that come after this one.
								</Typography>

								<Button
									variant="outlined"
									startIcon={<TuneIcon />}
									onClick={onSetSymbolField}
									sx={{ mt: 2, mb: 2, maxWidth: 350 }}
								>
									Set Symbology
								</Button>

								{symbol !== undefined && isEmpty(symbol) === false && (
									<Typography variant="caption">Symbology has been set</Typography>
								)}

								{(symbol === undefined || isEmpty(symbol) === true) && (
									<Typography variant="caption">Symbology has not been set</Typography>
								)}
							</FormGroup>

							{errors.symbol && <FormHelperText error>Symbol errors: {errors.symbol.message}</FormHelperText>}
						</FormControl>
					</form>
				</DialogContent>

				<DialogActions>
					<Button onClick={onCancel}>Cancel</Button>
					<Button onClick={onClickSave}>Save</Button>
				</DialogActions>
			</DialogWithTransition>

			{isSettingSymbol === true && (
				<SymbologyFieldEditor
					symbol={symbol}
					onDone={onDoneSettingSymbol}
					onCancel={onCancelSettingSymbol}
					nameFieldRequired={false}
					iconFieldRequired={false}
				/>
			)}
		</React.Fragment>
	);
}

export default SchemaFieldFormForSymbologyBoolean;
