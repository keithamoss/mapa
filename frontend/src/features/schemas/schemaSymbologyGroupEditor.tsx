import { yupResolver } from '@hookform/resolvers/yup';
import { Button, DialogActions, DialogContent, DialogTitle, FormHelperText, TextField } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../app/forms/formUtils';
import { symbologyGroupFormValidationSchema } from '../../app/forms/symbologyGroupForm';
import { FeatureSchemaSymbologyGroup } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';

interface Props {
	group?: FeatureSchemaSymbologyGroup;
	onDone: (groupName: string) => void;
	onCancel: () => void;
}

function SchemaSymbologyGroupEditor(props: Props) {
	console.log('### SchemaSymbologyGroupEditor ###');

	const { group, onDone, onCancel } = props;

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaSymbologyGroup>({
		resolver: yupResolver(symbologyGroupFormValidationSchema),
		defaultValues: {
			name: group?.name || '',
		},
	});

	const onDoneWithForm: SubmitHandler<FeatureSchemaSymbologyGroup> = (data) => {
		if (isEmpty(data) === false) {
			onDone(data.name);
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const textInput = React.useRef<HTMLInputElement>(null);

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
							<TextField {...field} inputRef={textInput} label="Group name" margin="dense" fullWidth />
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
