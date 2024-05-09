import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	AppBar,
	Box,
	Button,
	Checkbox,
	Chip,
	FormControl,
	FormGroup,
	FormHelperText,
	IconButton,
	InputLabel,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Paper,
	Select,
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
import FormSectionHeading from '../../app/ui/formSectionHeading';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { selectAllFeatures } from '../features/featuresSlice';
import { selectAllFeatureSchemas } from '../schemas/schemasSlice';
import SymbologyFieldEditor from '../symbology/symbologyFieldEditor';

interface Props {
	map?: Map;
	isMapSaving: boolean;
	onDoneAdding?: (map: NewMap) => void;
	onDoneEditing?: (map: Map) => void;
}

function MapForm(props: Props) {
	const { map, isMapSaving, onDoneAdding, onDoneEditing } = props;

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
			hero_icon: map?.hero_icon || undefined,
			available_schema_ids: map?.available_schema_ids || [],
		},
	});

	const { hero_icon, default_symbology, available_schema_ids } = watch();

	// ######################
	// Map Hero Icon
	// ######################
	const [isSettingMapHeroIcon, setIsSettingMapHeroIcon] = useState(false);

	const onSetMapHeroIcon = () => {
		setIsSettingMapHeroIcon(true);
	};

	const onDoneSettingMapHeroIcon = (symbolField: SymbologyProps) => {
		setValue('hero_icon', symbolField, { shouldDirty: true });
		setIsSettingMapHeroIcon(false);
	};

	const onCancelSettingMapHeroIcon = () => setIsSettingMapHeroIcon(false);
	// ######################
	// Map Hero Icon (End)
	// ######################

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

	// ######################
	// Schema Removal Guard
	// ######################
	const features = useAppSelector(selectAllFeatures);

	const schemasUsedOnMap = Array.from(new Set(Object.values(features || []).map((f) => f.schema_id)));
	// ######################
	// Schema Removal Guard (End)
	// ######################

	// ######################
	// Form Management
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
				const mapData: Map = {
					...map,
					...data,
					// For some reason when we were saving a Map, MapForm was turning a null hero_icon into an empty {} object, rather than retaining it as null.
					// No amount of playing with the Yup Resolver that was possibly causing this could get us to make it return null rather than {}.
					// So oh well, this hack will do.
					hero_icon: JSON.stringify(data.hero_icon) !== '{}' ? data.hero_icon : null,
				};
				onDoneEditing(mapData);
			}
		}
	};

	const onClose = () => navigate('/MapManager');

	const onCancelForm = () => {
		if (isDirty === true) {
			setIsDiscardChangesDialogShown(true);
		} else {
			onClose();
		}
	};
	// ######################
	// Form Management (End)
	// ######################

	// ######################
	// Discard Changes
	// ######################
	const [isDiscardChangesDialogShown, setIsDiscardChangesDialogShown] = useState(false);

	const onConfirmDiscardChanges = () => onClose();

	const onCancelDiscardChangesDialog = () => setIsDiscardChangesDialogShown(false);
	// ######################
	// Discard Changes (End)
	// ######################

	return (
		<React.Fragment>
			{isDiscardChangesDialogShown === true && (
				<DiscardChangesDialog onNo={onCancelDiscardChangesDialog} onYes={onConfirmDiscardChanges} />
			)}

			<DialogWithTransition onClose={onCancelForm}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onCancelForm}>
							<CloseIcon />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Map
						</Typography>

						<LoadingButton loading={isMapSaving} color="inherit" onClick={onClickSave}>
							{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
							<span>Save</span>
						</LoadingButton>
					</Toolbar>
				</AppBar>

				<form onSubmit={handleSubmit(onDoneWithForm)}>
					<Paper elevation={0} sx={{ m: 3 }}>
						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="name"
									control={control}
									render={({ field }) => <TextFieldWithout1Password {...field} label="Name" />}
								/>
							</FormGroup>

							{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormSectionHeading>Map icon</FormSectionHeading>

							<FormGroup>
								<Typography variant="body2">Create an icon to represent your map.</Typography>

								<Button
									variant="outlined"
									startIcon={<TuneIcon />}
									onClick={onSetMapHeroIcon}
									sx={{ mt: 2, mb: 2, maxWidth: 350 }}
								>
									Set Icon
								</Button>

								{(hero_icon === undefined || isEmpty(hero_icon) === true) && (
									<Typography variant="caption">No icon has been set</Typography>
								)}
							</FormGroup>

							{errors.hero_icon && <FormHelperText error>{errors.hero_icon.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormSectionHeading>Default symbology</FormSectionHeading>

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
								<FormSectionHeading>Schemas</FormSectionHeading>

								<Typography variant="body2">
									Choose the schemas you would like to use on this map. If schemas are in use on the map, they will be
									unable to be removed.
								</Typography>
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
												<MenuItem key={schema.id} value={schema.id} disabled={schemasUsedOnMap.includes(schema.id)}>
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

			{isSettingMapHeroIcon === true && (
				<SymbologyFieldEditor
					symbol={hero_icon}
					onDone={onDoneSettingMapHeroIcon}
					onCancel={onCancelSettingMapHeroIcon}
					nameFieldRequired={false}
					iconFieldRequired={true}
				/>
			)}
		</React.Fragment>
	);
}

export default MapForm;
