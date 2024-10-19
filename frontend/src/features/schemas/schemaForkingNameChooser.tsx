import { yupResolver } from '@hookform/resolvers/yup';
import { Button, DialogActions, DialogContent, DialogTitle, FormHelperText } from '@mui/material';
import { isEmpty } from 'lodash-es';
import { useRef } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../app/forms/formUtils';
import { forkingSchemaFormValidationSchema } from '../../app/forms/schemaForking';
import type { FeatureSchemaForkingSchemaModifiableProps } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';

interface Props {
	name: string; // The name of the schema being forked
	onDone: (schemaName: string) => void;
	onCancel: () => void;
}

function SchemaForkingNameChooser(props: Props) {
	const { name, onDone, onCancel } = props;

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeatureSchemaForkingSchemaModifiableProps>({
		resolver: yupResolver(forkingSchemaFormValidationSchema),
		defaultValues: {
			name,
		},
	});

	const onDoneWithForm: SubmitHandler<FeatureSchemaForkingSchemaModifiableProps> = (data) => {
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
			<DialogTitle>Fork Schema</DialogTitle>
			<DialogContent>
				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<TextFieldWithout1Password {...field} inputRef={textInput} label="Schema name" margin="dense" fullWidth />
						)}
					/>

					{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onClickSave}>Fork</Button>
			</DialogActions>
		</DialogWithTransition>
	);
}

export default SchemaForkingNameChooser;
