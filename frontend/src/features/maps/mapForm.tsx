import CloseIcon from '@mui/icons-material/Close';

import TuneIcon from '@mui/icons-material/Tune';

import { yupResolver } from '@hookform/resolvers/yup';
import {
	AppBar,
	Box,
	Button,
	Checkbox,
	Chip,
	FormControl,
	FormGroup,
	FormHelperText,
	FormLabel,
	IconButton,
	InputLabel,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Paper,
	Select,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { mapFormValidationSchema } from '../../app/forms/mapForm';
import { useAppSelector } from '../../app/hooks/store';
import { Map, MapModifiableProps, NewMap } from '../../app/services/maps';
import { SymbologyProps } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import DiscardChangesDialog from '../../app/ui/discardChangesDialog';
import { selectAllFeatureSchemas } from '../schemas/schemasSlice';
import SymbologyFieldEditor from '../symbology/symbologyFieldEditor';

interface Props {
	map?: Map;
	onDoneAdding?: (map: NewMap) => void;
	onDoneEditing?: (map: Map) => void;
}

function MapForm(props: Props) {
	console.log('### MapForm ###');

	const { map, onDoneAdding, onDoneEditing } = props;

	const navigate = useNavigate();

	const schemas = useAppSelector(selectAllFeatureSchemas);

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<MapModifiableProps>({
		resolver: yupResolver(mapFormValidationSchema),
		defaultValues: {
			name: map?.name || '',
			default_symbology: map?.default_symbology || undefined,
			available_schema_ids: map?.available_schema_ids || [],
		},
	});

	const { default_symbology, available_schema_ids } = watch();

	// ######################
	// Default Symbology
	// ######################
	const [isSettingDefaultSymbol, setIsSettingDefaultSymbol] = useState(false);

	const onSetDefaultSymbolField = () => {
		setIsSettingDefaultSymbol(true);
	};

	const onDoneSettingDefaultSymbol = (symbolField: SymbologyProps) => {
		setValue('default_symbology', symbolField, { shouldDirty: true });
		setIsSettingDefaultSymbol(false);
	};

	const onCancelSettingDefaultSymbol = () => setIsSettingDefaultSymbol(false);
	// ######################
	// Default Symbology (End)
	// ######################

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onDoneWithForm: SubmitHandler<MapModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			if (map === undefined && onDoneAdding !== undefined) {
				const mapData: NewMap = { ...data };
				onDoneAdding(mapData);
			} else if (map !== undefined && onDoneEditing !== undefined) {
				const mapData: Map = { ...map, ...data };
				onDoneEditing(mapData);
			}
		}
	};

	const onClose = () => navigate(-1);

	const onCancelForm = () => {
		if (isDirty === true) {
			setIsDiscardChangesDialogShown(true);
		} else {
			onClose();
		}
	};

	const [isDiscardChangesDialogShown, setIsDiscardChangesDialogShown] = useState(false);

	const onConfirmDiscardChanges = () => onClose();

	const onCancelDiscardChangesDialog = () => setIsDiscardChangesDialogShown(false);

	return (
		<React.Fragment>
			{isDiscardChangesDialogShown === true && (
				<DiscardChangesDialog onNo={onCancelDiscardChangesDialog} onYes={onConfirmDiscardChanges} />
			)}

			<DialogWithTransition onClose={onCancelForm}>
				<AppBar sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onCancelForm}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Map
						</Typography>
						<Button color="inherit" onClick={onClickSave}>
							Save
						</Button>
					</Toolbar>
				</AppBar>

				<form onSubmit={handleSubmit(onDoneWithForm)}>
					<Paper elevation={0} sx={{ m: 3 }}>
						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="name"
									control={control}
									render={({ field }) => <TextField {...field} label="Name" />}
								/>
							</FormGroup>

							{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormLabel component="legend" sx={{ mb: 1 }}>
								Default symbology
							</FormLabel>

							<FormGroup>
								<Typography variant="body2">
									You can set symbology defaults for this map. These will be replaced by any symbology set by schemas or
									individual features.
								</Typography>

								<Button
									variant="outlined"
									startIcon={<TuneIcon />}
									onClick={onSetDefaultSymbolField}
									sx={{ mt: 2, mb: 2, maxWidth: 350 }}
								>
									Set Defaults
								</Button>

								{default_symbology !== undefined && isEmpty(default_symbology) === false && (
									<Typography variant="caption">Defaults have been set</Typography>
								)}

								{(default_symbology === undefined || isEmpty(default_symbology) === true) && (
									<Typography variant="caption">No defaults are set</Typography>
								)}
							</FormGroup>

							{errors.default_symbology && <FormHelperText error>{errors.default_symbology.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<FormLabel component="legend" sx={{ mb: 1 }}>
									Schemas
								</FormLabel>

								<Typography variant="body2">Choose the schemas you would like to use on this map.</Typography>
							</FormGroup>
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<InputLabel>Schemas</InputLabel>

								<Controller
									name="available_schema_ids"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											multiple
											input={<OutlinedInput label="Schemas" />}
											renderValue={(selected) => (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{schemas
														.filter((schema) => selected.includes(schema.id) === true)
														.map((schema) => (
															<Chip key={schema.id} label={schema.name} />
														))}
												</Box>
											)}
										>
											{schemas.map((schema) => (
												<MenuItem key={schema.id} value={schema.id}>
													<Checkbox checked={available_schema_ids.includes(schema.id) === true} />
													<ListItemText primary={schema.name} />
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormGroup>

							{errors.available_schema_ids && (
								<FormHelperText error>{errors.available_schema_ids.message}</FormHelperText>
							)}
						</FormControl>
					</Paper>
				</form>
			</DialogWithTransition>

			{isSettingDefaultSymbol === true && (
				<SymbologyFieldEditor
					symbol={default_symbology}
					onDone={onDoneSettingDefaultSymbol}
					onCancel={onCancelSettingDefaultSymbol}
					nameFieldRequired={false}
					iconFieldRequired={false}
				/>
			)}
		</React.Fragment>
	);
}

export default MapForm;
