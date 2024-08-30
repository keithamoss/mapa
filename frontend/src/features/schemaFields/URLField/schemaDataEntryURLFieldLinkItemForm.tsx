import { yupResolver } from '@hookform/resolvers/yup';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormGroup,
	FormHelperText,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../../app/forms/formUtils';
import { schemaURLFieldLinkItemFormValidationSchema } from '../../../app/forms/schemaFieldsForms';
import {
	FeatureDataItemURLFieldLinkItem,
	FeatureDataItemURLFieldLinkItemFormModifiableProps,
} from '../../../app/services/features';
import { DialogWithTransition } from '../../../app/ui/dialog';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';

interface Props {
	urlFieldLinkItem?: FeatureDataItemURLFieldLinkItem;
	onDoneAdding: (linkItemData: FeatureDataItemURLFieldLinkItem) => void;
	onDoneEditing: (linkItemData: FeatureDataItemURLFieldLinkItem) => void;
	onCancel: () => void;
}

function SchemaDataEntryURLFieldLinkItemForm(props: Props) {
	const { urlFieldLinkItem, onDoneAdding, onDoneEditing, onCancel } = props;

	const isAddingNewLink = urlFieldLinkItem === undefined;

	const {
		setValue,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureDataItemURLFieldLinkItemFormModifiableProps>({
		resolver: yupResolver(schemaURLFieldLinkItemFormValidationSchema),
		defaultValues: {
			name: urlFieldLinkItem?.name || undefined,
			url: urlFieldLinkItem?.url || undefined,
		},
	});

	const onDoneWithForm: SubmitHandler<FeatureDataItemURLFieldLinkItemFormModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			if (urlFieldLinkItem === undefined && onDoneAdding !== undefined) {
				const linkItemData: FeatureDataItemURLFieldLinkItem = { ...data, id: crypto.randomUUID() };
				onDoneAdding(linkItemData);
			} else if (urlFieldLinkItem !== undefined && onDoneEditing !== undefined) {
				const linkItemData: FeatureDataItemURLFieldLinkItem = { ...urlFieldLinkItem, ...data };
				onDoneEditing(linkItemData);
			}
		}
	};

	const onClickSave = () => handleSubmit(onDoneWithForm)();

	const onPasteNameFromClipboard = (pastedText: string) => setValue('name', pastedText, { shouldDirty: true });

	const onPasteURLFromClipboard = (pastedText: string) => setValue('url', pastedText, { shouldDirty: true });

	return (
		<DialogWithTransition onClose={onCancel} dialogProps={{ fullScreen: false, fullWidth: true }}>
			<DialogTitle>{isAddingNewLink === true ? 'Add Link' : 'Edit Link'}</DialogTitle>

			<DialogContent>
				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<FormControl fullWidth={true} sx={{ mb: 3, mt: 1 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextFieldWithPasteAdornment
										{...{ ...field, value: field.value !== undefined ? field.value : '' }}
										required={true}
										label="Link name"
										onPasteFromClipboard={onPasteNameFromClipboard}
									/>
								)}
							/>
						</FormGroup>

						{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 1, mt: 1 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="url"
								control={control}
								render={({ field }) => (
									<TextFieldWithPasteAdornment
										{...{ ...field, value: field.value !== undefined ? field.value : '' }}
										required={true}
										label="URL"
										onPasteFromClipboard={onPasteURLFromClipboard}
									/>
								)}
							/>
						</FormGroup>

						{errors.url && <FormHelperText error>{errors.url.message}</FormHelperText>}
					</FormControl>
				</form>
			</DialogContent>

			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onClickSave}>{isAddingNewLink === true ? 'Add' : 'Save'}</Button>
			</DialogActions>
		</DialogWithTransition>
	);
}

export default SchemaDataEntryURLFieldLinkItemForm;
