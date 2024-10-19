import { yupResolver } from '@hookform/resolvers/yup';
import { Button, DialogActions, DialogContent, DialogTitle, FormHelperText } from '@mui/material';
import { isEmpty } from 'lodash-es';
import { useRef } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../app/forms/formUtils';
import { symbologyGroupFormValidationSchema } from '../../app/forms/symbologyGroupForm';
import type { FeatureSchemaSymbologyGroup, FeatureSchemaSymbologyGroupModifiableProps } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';

interface Props {
	group?: FeatureSchemaSymbologyGroup;
	onDone: (groupName: string) => void;
	onCancel: () => void;
}

function SchemaSymbologyGroupEditor(props: Props) {
	const { group, onDone, onCancel } = props;

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaSymbologyGroupModifiableProps>({
		resolver: yupResolver(symbologyGroupFormValidationSchema),
		defaultValues: {
			name: group?.name || '',
		},
	});

	const onDoneWithForm: SubmitHandler<FeatureSchemaSymbologyGroupModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data.name);
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const textInput = useRef<HTMLInputElement>(null);

	return (
		<DialogWithTransition
			onClose={onCancel}
			dialogProps={{ fullScreen: false, fullWidth: true }}
			transitionProps={{
				addEndListener: () => {
					if (textInput.current !== null) {
						textInput.current.focus();
					}
				},
			}}
		>
			<DialogTitle>{group !== undefined ? 'Edit Group' : 'Create Group'}</DialogTitle>
			<DialogContent>
				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<TextFieldWithout1Password {...field} inputRef={textInput} label="Group name" margin="dense" fullWidth />
						)}
					/>

					{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onClickSave}>Save</Button>
			</DialogActions>
		</DialogWithTransition>
	);
}

export default SchemaSymbologyGroupEditor;
