import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';

import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	AlertTitle,
	AppBar,
	Badge,
	BottomNavigation,
	BottomNavigationAction,
	Box,
	Button,
	FormControl,
	FormGroup,
	FormHelperText,
	FormLabel,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	TextField,
	Toolbar,
} from '@mui/material';
import Typography from '@mui/material/Typography';

import { isEmpty, pickBy } from 'lodash-es';
import React, { SyntheticEvent, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../app/forms/formUtils';
import {
	getColourFromSVGOrDefaultForSymbologyField,
	getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange,
	getNumberOrDefaultForSymbologyField,
	getStringOrDefaultForSymbologyField,
	getStringOrEmptyStringForSymbologyField,
	getStringOrUndefinedForSymbologyField,
	symbolMaximumOpacity,
	symbolMaximumRotation,
	symbolMaximumSize,
	symbolMinimumOpacity,
	symbolMinimumRotation,
	symbolMinimumSize,
	symbologyFormValidationSchema,
} from '../../app/forms/symbologyForm';
import { FeatureSchemaSymbologyGroup, SymbologyProps } from '../../app/services/schemas';
import {
	defaultSymbolColour,
	defaultSymbolIcon,
	defaultSymbolOpacity,
	defaultSymbolRotation,
	defaultSymbolSecondaryColour,
	defaultSymbolSecondaryOpacity,
	defaultSymbolSize,
	defaultSymbolSizeForFormFields,
	defaultSymbolTertiaryColour,
	defaultSymbolTertiaryOpacity,
	defaultSymbologyGroupId,
	getAppDefaultSymbologyConfig,
	getFontAwesomeIconForSymbolPreview,
	getFontAwesomeIconFromLibraryAsSVGImage,
} from './symbologyHelpers';

import { useAppSelector } from '../../app/hooks/store';
import { Map } from '../../app/services/maps';
import { DialogWithTransition } from '../../app/ui/dialog';
import DiscardChangesDialog from '../../app/ui/discardChangesDialog';
import { selectMapById } from '../maps/mapsSlice';
import SchemaSymbologyGroupEditor from '../schemas/schemaSymbologyGroupEditor';
import './colourPicker.css';
import {
	IconStyle,
	getDefaultStyleByIconName,
	getIconLabelByName,
	getIconStyleName,
	isIconColourLockedByName,
	isIconStyleDuotoneOrTritone,
	isIconStyleTritone,
} from './iconsLibrary';
import SliderFixed from './sliderFixed';
import SymbologyIconChooser from './symbologyIconChooser';
import SymbologyIconStyleChooser from './symbologyIconStyleChooser';

const getDefaultValues = (symbol: SymbologyProps | null | undefined) => {
	const icon = getStringOrDefaultForSymbologyField(symbol, 'icon', defaultSymbolIcon);
	const icon_style = getStringOrDefaultForSymbologyField(symbol, 'icon_style', getDefaultStyleByIconName(icon));

	const defaultValues = {
		name: getStringOrEmptyStringForSymbologyField(symbol, 'name'),
		icon,
		icon_style,
		colour: getColourFromSVGOrDefaultForSymbologyField(
			symbol,
			'colour',
			'primary',
			icon,
			icon_style as IconStyle,
			defaultSymbolColour,
		),
		opacity: getNumberOrDefaultForSymbologyField(symbol, 'opacity', defaultSymbolOpacity),
		secondary_colour: getColourFromSVGOrDefaultForSymbologyField(
			symbol,
			'secondary_colour',
			'secondary',
			icon,
			icon_style as IconStyle,
			defaultSymbolSecondaryColour,
		),
		secondary_opacity: getNumberOrDefaultForSymbologyField(symbol, 'secondary_opacity', defaultSymbolSecondaryOpacity),
		tertiary_colour: getColourFromSVGOrDefaultForSymbologyField(
			symbol,
			'tertiary_colour',
			'tertiary',
			icon,
			icon_style as IconStyle,
			defaultSymbolTertiaryColour,
		),
		tertiary_opacity: getNumberOrDefaultForSymbologyField(symbol, 'tertiary_opacity', defaultSymbolTertiaryOpacity),
		modifier_icon: getStringOrUndefinedForSymbologyField(symbol, 'modifier_icon'),
		modifier_colour: getStringOrDefaultForSymbologyField(symbol, 'modifier_colour', defaultSymbolColour),
		modifier_opacity: getNumberOrDefaultForSymbologyField(symbol, 'modifier_opacity', defaultSymbolOpacity),
		size: getNumberOrDefaultForSymbologyField(symbol, 'size', defaultSymbolSize),
		rotation: getNumberOrDefaultForSymbologyField(symbol, 'rotation', defaultSymbolRotation),
	};

	return pickBy(defaultValues, (v) => v !== undefined);
};

export const getAppMapAndSchemaDefaultSymbologyConfigForForm = (
	mapDefaultSymbology: SymbologyProps | null | undefined,
	schemaDefaultSymbology: SymbologyProps | null | undefined,
) => {
	const defaults = { ...getAppDefaultSymbologyConfig(), ...mapDefaultSymbology, ...schemaDefaultSymbology };

	// This UI is all about choosing an icon, so we don't want
	// to delete any defaults props about the icon itself.
	// ...actually, scratch that!
	// We do want to delete defaults for the icon because
	// components like SchemaFieldFormForSymbologyBoolean rely
	// being able to only set any fields e.g. just the modifier icon.
	// delete defaults.icon;
	// delete defaults.icon_style;

	return defaults as Partial<SymbologyProps>;
};

const removeDefaultValuesFromForm = (
	data: SymbologyProps,
	defaults: Partial<SymbologyProps>,
	nameFieldRequired: boolean,
	iconFieldRequired: boolean,
) => {
	Object.keys(data).forEach((propName) => {
		if (data[propName as keyof SymbologyProps] === defaults[propName as keyof SymbologyProps]) {
			delete data[propName as keyof SymbologyProps];
		}

		if (propName === 'name' && nameFieldRequired === false && data[propName as keyof SymbologyProps] === '') {
			delete data[propName as keyof SymbologyProps];
		}

		if (propName === 'icon' && iconFieldRequired === false && data[propName as keyof SymbologyProps] === '') {
			delete data[propName as keyof SymbologyProps];
		}
	});

	if (isIconStyleDuotoneOrTritone(data.icon_style) === false) {
		delete data.secondary_colour;
		delete data.secondary_opacity;
	}

	if (isIconStyleTritone(data.icon_style) === false) {
		delete data.tertiary_colour;
		delete data.tertiary_opacity;
	}

	if (data.modifier_icon === undefined) {
		delete data.modifier_icon;
		delete data.modifier_colour;
		delete data.modifier_opacity;
	}

	return data;
};

interface EntrypointProps {
	schemaDefaultSymbology?: SymbologyProps | null;
	mapId?: number;
	symbol?: SymbologyProps | null;
	onDone: (symbolField: SymbologyProps, groupId: number) => void;
	onCancel: () => void;
	groups?: FeatureSchemaSymbologyGroup[];
	onAddGroup?: (groupName: string) => number;
	currentGroupId?: number;
	nameFieldRequired: boolean;
	iconFieldRequired: boolean;
}

function SymbologyFieldEditorEntrypoint(props: EntrypointProps) {
	const { mapId, ...rest } = props;

	if (mapId === undefined) {
		return <SymbologyFieldEditor {...rest} />;
	}

	return <SymbologyFieldEditorEntrypointLayer2 {...props} mapId={mapId} />;
}

interface EntrypointPropsLayer2 extends EntrypointProps {
	mapId: number;
}

function SymbologyFieldEditorEntrypointLayer2(props: EntrypointPropsLayer2) {
	const { mapId } = props;

	const map = useAppSelector((state) => selectMapById(state, mapId));

	if (map === undefined) {
		return null;
	}

	return <SymbologyFieldEditor map={map} {...props} />;
}

interface Props extends Omit<EntrypointProps, 'mapId'> {
	map?: Map;
}

function SymbologyFieldEditor(props: Props) {
	const {
		schemaDefaultSymbology,
		map,
		symbol,
		onDone,
		onCancel,
		groups,
		onAddGroup,
		currentGroupId,
		nameFieldRequired,
		iconFieldRequired,
	} = props;

	// ######################
	// Form
	// ######################
	const {
		watch,
		register,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<SymbologyProps>({
		resolver: yupResolver(symbologyFormValidationSchema(nameFieldRequired, iconFieldRequired)),
		defaultValues: getDefaultValues({
			...map?.default_symbology,
			...schemaDefaultSymbology,
			...symbol,
		}),
	});

	const {
		icon,
		icon_style,
		colour,
		opacity,
		secondary_colour,
		secondary_opacity,
		tertiary_colour,
		tertiary_opacity,
		modifier_icon,
		modifier_colour,
		modifier_opacity,
		size,
		rotation,
	} = watch();

	const textInput = useRef<HTMLInputElement>(null);

	const onDoneWithForm: SubmitHandler<SymbologyProps> = (data) => {
		const dataWithDefaultsRemoved = removeDefaultValuesFromForm(
			data,
			getAppMapAndSchemaDefaultSymbologyConfigForForm(map?.default_symbology, schemaDefaultSymbology),
			nameFieldRequired,
			iconFieldRequired,
		);

		if (isEmpty(dataWithDefaultsRemoved) === false) {
			onDone(dataWithDefaultsRemoved, selectedGroupId);
		} else {
			// Avoids SymbologyIconAutocomplete problems with undefined values
			onClose();
		}
	};

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onClose = () => onCancel();

	const onCancelForm = () => {
		if (isDirty === true || selectedGroupId !== (currentGroupId || defaultSymbologyGroupId)) {
			setIsDiscardChangesDialogShown(true);
		} else {
			onClose();
		}
	};

	const [isDiscardChangesDialogShown, setIsDiscardChangesDialogShown] = useState(false);

	const onConfirmDiscardChanges = () => onClose();

	const onCancelDiscardChangesDialog = () => setIsDiscardChangesDialogShown(false);
	// ######################
	// Form (End)
	// ######################

	// ######################
	// Bottom Navigation
	// ######################
	const [navigationValue, setNavigationValue] = useState(0);

	const onChangeBottomNavigation = (_event: SyntheticEvent, newValue: number) => {
		setNavigationValue(newValue);
	};
	// ######################
	// Bottom Navigation (End)
	// ######################

	// ######################
	// Icon Chooser Dialog
	// ######################
	const [isIconChooserOpen, setIsIconChooserOpen] = useState(false);

	const onOpenIconChooser = () => setIsIconChooserOpen(true);

	const onChooseIconFromIconChooser = (icon: string, icon_style: IconStyle) => {
		setValue('icon', icon, { shouldDirty: true });
		setValue('icon_style', icon_style, { shouldDirty: true });

		setValue(
			'colour',
			getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
				'primary',
				icon,
				icon_style,
				defaultSymbolColour,
			),
			{
				shouldDirty: true,
			},
		);

		setValue(
			'secondary_colour',
			getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
				'secondary',
				icon,
				icon_style,
				defaultSymbolSecondaryColour,
			),
			{ shouldDirty: true },
		);

		setValue(
			'tertiary_colour',
			getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
				'tertiary',
				icon,
				icon_style,
				defaultSymbolTertiaryColour,
			),
			{ shouldDirty: true },
		);

		setIsIconChooserOpen(false);
	};

	const onCloseSymbologyIconChooser = () => setIsIconChooserOpen(false);
	// ######################
	// Icon Chooser Dialog (End)
	// ######################

	// ######################
	// Icon Style Choosing
	// ######################
	const [isIconStyleChooserOpen, setIsIconStyleChooserOpen] = useState(false);

	const onOpenIconStyleChooser = () => setIsIconStyleChooserOpen(true);

	const onChooseIconStyle = (icon_style: IconStyle) => {
		setValue('icon_style', icon_style, { shouldDirty: true });

		// See note in getAvailableStylesForIcon()
		// This needs to be re-enabled when we return to icons that have default colours applied.
		// The logic goes something like "If the icon has default colours, use those when we change styles.
		// If not, use the existing colour - which itself has either been chosen by the user or is one of the
		// default fallback colours defined by the application"
		// setValue(
		// 	'colour',
		// 	getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
		// 		'primary',
		// 		icon || defaultSymbolIcon,
		// 		icon_style,
		// 		defaultSymbolColour,
		// 	),
		// 	{ shouldDirty: true },
		// );

		// setValue(
		// 	'secondary_colour',
		// 	getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
		// 		'secondary',
		// 		icon || defaultSymbolIcon,
		// 		icon_style,
		// 		defaultSymbolSecondaryColour,
		// 	),
		// 	{ shouldDirty: true },
		// );

		// setValue(
		// 	'tertiary_colour',
		// 	getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange(
		// 		'tertiary',
		// 		icon || defaultSymbolIcon,
		// 		icon_style,
		// 		defaultSymbolTertiaryColour,
		// 	),
		// 	{ shouldDirty: true },
		// );

		setIsIconStyleChooserOpen(false);
	};

	const onCloseStyleChooser = () => setIsIconStyleChooserOpen(false);
	// ######################
	// Icon Style Choosing (End)
	// ######################

	// ######################
	// Icon Modifier Choosing
	// ######################
	const [isIconModifierChooserOpen, setIsIconModifierChooserOpen] = useState(false);

	const onOpenIconModifierChooser = () => setIsIconModifierChooserOpen(true);

	const onChooseIconModifier = (icon: string) => {
		setValue('modifier_icon', icon, { shouldDirty: true });
		setIsIconModifierChooserOpen(false);
	};

	const onClearIconModifier = () => {
		setValue('modifier_icon', undefined, { shouldDirty: true });
	};

	const onCloseIconModifierChooser = () => setIsIconModifierChooserOpen(false);
	// ######################
	// Icon Modifier Choosing (End)
	// ######################

	// ######################
	// Choose Group
	// ######################
	const [selectedGroupId, setSelectedGroupId] = useState<number>(currentGroupId || defaultSymbologyGroupId);

	const onChooseGroupId = (e: SelectChangeEvent<number>) => {
		const groupId = parseInt(`${e.target.value}`);

		if (Number.isNaN(groupId) === false) {
			setSelectedGroupId(groupId);
		}
	};
	// ######################
	// Choose Group (End)
	// ######################

	// ######################
	// Add Group
	// ######################
	const [isAddingGroup, setIsAddingGroup] = useState(false);

	const onClickAddNewGroup = () => {
		setIsAddingGroup(true);
	};

	const onDoneAddingGroup = (groupName: string) => {
		if (onAddGroup !== undefined) {
			setSelectedGroupId(onAddGroup(groupName));
			setIsAddingGroup(false);
		}
	};

	const onCancelAddingGroup = () => {
		setIsAddingGroup(false);
	};
	// ######################
	// Add Group (End)
	// ######################

	return (
		<React.Fragment>
			{isDiscardChangesDialogShown === true && (
				<DiscardChangesDialog onNo={onCancelDiscardChangesDialog} onYes={onConfirmDiscardChanges} />
			)}
			{isIconChooserOpen === true && (
				<SymbologyIconChooser onChoose={onChooseIconFromIconChooser} onClose={onCloseSymbologyIconChooser} />
			)}
			{isIconStyleChooserOpen === true && icon !== undefined && (
				<SymbologyIconStyleChooser selectedIcon={icon} onChoose={onChooseIconStyle} onClose={onCloseStyleChooser} />
			)}
			{isIconModifierChooserOpen === true && icon !== undefined && (
				<SymbologyIconChooser
					onlyShowModifiers={true}
					onChoose={onChooseIconModifier}
					onClose={onCloseIconModifierChooser}
				/>
			)}
			<DialogWithTransition onClose={onCancelForm}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onCancelForm}>
							<CloseIcon />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Symbol
						</Typography>

						<Button color="inherit" onClick={onClickSave}>
							Save
						</Button>
					</Toolbar>
				</AppBar>

				<Box
					sx={{
						position: 'sticky',
						zIndex: 10,
						top: 56, // The height of the AppBar
						ml: 3,
						mr: 3,
						pt: 3,
						pb: 3,
						backgroundColor: 'white',
					}}
				>
					<Paper variant="outlined" sx={{ mt: 0, pt: 2, pb: 2, textAlign: 'center' }}>
						{symbol !== null &&
							getFontAwesomeIconForSymbolPreview({
								...symbol,
								icon,
								icon_style,
								colour,
								opacity,
								secondary_colour,
								secondary_opacity,
								tertiary_colour,
								tertiary_opacity,
								modifier_icon,
								modifier_colour,
								modifier_opacity,
								size: (size !== undefined ? size : defaultSymbolSizeForFormFields) * 2,
								rotation,
							})}
					</Paper>
				</Box>

				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<Paper elevation={0} sx={{ m: 3, mt: 0 }}>
						{navigationValue === 0 && (
							<React.Fragment>
								{nameFieldRequired !== false && (
									<FormControl fullWidth={true} sx={{ mb: 3, mt: 1 }} component="fieldset" variant="outlined">
										<FormGroup>
											<Controller
												name="name"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														inputRef={textInput}
														// Makes shouldFocusError work
														// c.f. https://stackoverflow.com/a/74529792
														ref={register('name').ref}
														label="Name"
													/>
												)}
											/>
										</FormGroup>

										{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
									</FormControl>
								)}

								{groups !== undefined && (
									<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
										<FormGroup>
											<InputLabel>Group</InputLabel>

											{onClickAddNewGroup !== undefined && (
												<Paper elevation={0} sx={{ display: 'flex' }}>
													<Select label="Group" sx={{ flex: 1 }} value={selectedGroupId} onChange={onChooseGroupId}>
														{groups.map((group) => (
															<MenuItem key={group.id} value={group.id}>
																{group.name}
															</MenuItem>
														))}
													</Select>

													<IconButton color="default" onClick={onClickAddNewGroup}>
														<AddCircleIcon />
													</IconButton>
												</Paper>
											)}

											{onClickAddNewGroup === undefined && (
												<Select label="Group" value={selectedGroupId} onChange={onChooseGroupId}>
													{groups.map((group) => (
														<MenuItem key={group.id} value={group.id}>
															{group.name}
														</MenuItem>
													))}
												</Select>
											)}
										</FormGroup>
									</FormControl>
								)}

								<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
									<FormGroup>
										<TextField
											label="Icon"
											select
											value={icon || ''}
											SelectProps={{
												open: false,
												onClick: onOpenIconChooser,
											}}
											InputProps={{
												startAdornment:
													icon !== undefined ? (
														<InputAdornment position="start" sx={{ mr: 1 }}>
															{getFontAwesomeIconFromLibraryAsSVGImage(icon)}
														</InputAdornment>
													) : undefined,
											}}
										>
											{icon !== undefined ? <MenuItem value={icon}>{getIconLabelByName(icon)}</MenuItem> : <MenuItem />}
										</TextField>
									</FormGroup>

									{errors.icon && <FormHelperText error>{errors.icon.message}</FormHelperText>}
								</FormControl>

								<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
									<FormGroup>
										<TextField
											label="Style"
											select
											disabled={icon === undefined}
											value={icon_style !== undefined ? icon_style : ''}
											SelectProps={{
												open: false,
												onClick: onOpenIconStyleChooser,
											}}
											InputProps={{
												startAdornment:
													icon !== undefined && icon_style !== undefined ? (
														<InputAdornment position="start" sx={{ mr: 1 }}>
															{getFontAwesomeIconFromLibraryAsSVGImage(icon, icon_style)}
														</InputAdornment>
													) : undefined,
											}}
										>
											{icon_style !== undefined ? (
												<MenuItem value={icon_style}>{getIconStyleName(icon_style)}</MenuItem>
											) : (
												<MenuItem />
											)}
										</TextField>
									</FormGroup>

									{errors.icon_style && <FormHelperText error>{errors.icon_style.message}</FormHelperText>}
								</FormControl>

								<FormControl fullWidth={true} component="fieldset" variant="outlined">
									<FormLabel component="legend" sx={{ mb: 1 }}>
										Colour and Opacity
									</FormLabel>
								</FormControl>

								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										paddingLeft: '8px',
										paddingRight: '8px',
										marginBottom: '24px',
									}}
								>
									{icon !== undefined && isIconColourLockedByName(icon, icon_style) === false && (
										<React.Fragment>
											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(30%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<input type="color" className="colourPicker" {...register('colour')} />
												</FormGroup>

												{errors.colour && <FormHelperText error>{errors.colour.message}</FormHelperText>}
											</FormControl>

											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(70%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<Controller
														name="opacity"
														control={control}
														render={({ field }) => (
															<SliderFixed
																{...field}
																valueLabelDisplay="auto"
																min={symbolMinimumOpacity}
																max={symbolMaximumOpacity}
																track={false}
																step={0.1}
																marks={[
																	{
																		value: 0,
																		label: '0',
																	},
																	{
																		value: 0.25,
																		label: '0.25',
																	},
																	{
																		value: 0.5,
																		label: '0.5',
																	},
																	{
																		value: 0.75,
																		label: '0.75',
																	},
																	{
																		value: 1,
																		label: '1',
																	},
																]}
															/>
														)}
													/>
												</FormGroup>

												{errors.opacity && <FormHelperText error>{errors.opacity.message}</FormHelperText>}
											</FormControl>
										</React.Fragment>
									)}

									{icon !== undefined && isIconColourLockedByName(icon, icon_style) === true && (
										<Alert severity="info">
											<AlertTitle>This icon&apos;s colours cannot currently be changed.</AlertTitle>
											But anything is possible! If you would like to be able to customise the colour of the icon, please
											message the developer.
										</Alert>
									)}
								</div>

								{isIconStyleDuotoneOrTritone(icon_style) && (
									<React.Fragment>
										<FormControl fullWidth={true} component="fieldset" variant="outlined">
											<FormLabel component="legend" sx={{ mb: 1 }}>
												Secondary Colour and Opacity
											</FormLabel>
										</FormControl>

										<div
											style={{
												display: 'flex',
												flexDirection: 'row',
												paddingLeft: '8px',
												paddingRight: '8px',
												marginBottom: '24px',
											}}
										>
											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(30%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<input type="color" className="colourPicker" {...register('secondary_colour')} />
												</FormGroup>

												{errors.secondary_colour && (
													<FormHelperText error>{errors.secondary_colour.message}</FormHelperText>
												)}
											</FormControl>

											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(70%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<Controller
														name="secondary_opacity"
														control={control}
														render={({ field }) => (
															<SliderFixed
																{...field}
																valueLabelDisplay="auto"
																min={symbolMinimumOpacity}
																max={symbolMaximumOpacity}
																track={false}
																step={0.1}
																marks={[
																	{
																		value: 0,
																		label: '0',
																	},
																	{
																		value: 0.25,
																		label: '0.25',
																	},
																	{
																		value: 0.5,
																		label: '0.5',
																	},
																	{
																		value: 0.75,
																		label: '0.75',
																	},
																	{
																		value: 1,
																		label: '1',
																	},
																]}
															/>
														)}
													/>
												</FormGroup>

												{errors.secondary_opacity && (
													<FormHelperText error>{errors.secondary_opacity.message}</FormHelperText>
												)}
											</FormControl>
										</div>
									</React.Fragment>
								)}

								{isIconStyleTritone(icon_style) && (
									<React.Fragment>
										<FormControl fullWidth={true} component="fieldset" variant="outlined">
											<FormLabel component="legend" sx={{ mb: 1 }}>
												Tertiary Colour and Opacity
											</FormLabel>
										</FormControl>

										<div
											style={{
												display: 'flex',
												flexDirection: 'row',
												paddingLeft: '8px',
												paddingRight: '8px',
												marginBottom: '24px',
											}}
										>
											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(30%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<input type="color" className="colourPicker" {...register('tertiary_colour')} />
												</FormGroup>

												{errors.tertiary_colour && (
													<FormHelperText error>{errors.tertiary_colour.message}</FormHelperText>
												)}
											</FormControl>

											<FormControl
												fullWidth={true}
												sx={{
													width: 'calc(70%)',
												}}
												component="fieldset"
												variant="outlined"
											>
												<FormGroup>
													<Controller
														name="tertiary_opacity"
														control={control}
														render={({ field }) => (
															<SliderFixed
																{...field}
																valueLabelDisplay="auto"
																min={symbolMinimumOpacity}
																max={symbolMaximumOpacity}
																track={false}
																step={0.1}
																marks={[
																	{
																		value: 0,
																		label: '0',
																	},
																	{
																		value: 0.25,
																		label: '0.25',
																	},
																	{
																		value: 0.5,
																		label: '0.5',
																	},
																	{
																		value: 0.75,
																		label: '0.75',
																	},
																	{
																		value: 1,
																		label: '1',
																	},
																]}
															/>
														)}
													/>
												</FormGroup>

												{errors.tertiary_opacity && (
													<FormHelperText error>{errors.tertiary_opacity.message}</FormHelperText>
												)}
											</FormControl>
										</div>
									</React.Fragment>
								)}

								<FormControl fullWidth={true} sx={{ mb: 3, pl: 1, pr: 1 }} component="fieldset" variant="outlined">
									<FormLabel component="legend">Size</FormLabel>

									<FormGroup>
										<Controller
											name="size"
											control={control}
											render={({ field }) => (
												<SliderFixed
													{...field}
													valueLabelDisplay="auto"
													min={symbolMinimumSize}
													max={symbolMaximumSize}
													track={false}
													step={1}
													marks={[
														{
															value: 1,
															label: '1',
														},
														{
															value: 25,
															label: '25',
														},
														{
															value: 50,
															label: '50',
														},
													]}
												/>
											)}
										/>
									</FormGroup>

									{errors.size && <FormHelperText error>{errors.size.message}</FormHelperText>}
								</FormControl>

								{/* mb: 6 because we need breathing space to account for the BottomNavigation element */}
								<FormControl fullWidth={true} sx={{ mb: 6, pl: 1, pr: 1 }} component="fieldset" variant="outlined">
									<FormLabel component="legend">Rotation</FormLabel>

									<FormGroup>
										<Controller
											name="rotation"
											control={control}
											render={({ field }) => (
												<SliderFixed
													{...field}
													valueLabelDisplay="auto"
													min={symbolMinimumRotation}
													max={symbolMaximumRotation}
													track={false}
													step={10}
													marks={[
														{
															value: 0,
															label: '0',
														},
														{
															value: 90,
															label: '90',
														},
														{
															value: 180,
															label: '180',
														},
														{
															value: 270,
															label: '270',
														},
														{
															value: 360,
															label: '360',
														},
													]}
												/>
											)}
										/>
									</FormGroup>

									{errors.rotation && <FormHelperText error>{errors.rotation.message}</FormHelperText>}
								</FormControl>
							</React.Fragment>
						)}

						{navigationValue === 1 && (
							<React.Fragment>
								<FormControl fullWidth={true} sx={{ mb: 3, mt: 1 }} component="fieldset" variant="outlined">
									<FormGroup>
										<Paper elevation={0} sx={{ display: 'flex' }}>
											<TextField
												label="Modifier Icon"
												select
												value={modifier_icon || ''}
												SelectProps={{
													open: false,
													onClick: onOpenIconModifierChooser,
												}}
												InputProps={{
													startAdornment:
														modifier_icon !== undefined ? (
															<InputAdornment position="start" sx={{ mr: 1 }}>
																{getFontAwesomeIconFromLibraryAsSVGImage(modifier_icon, 'solid')}
															</InputAdornment>
														) : undefined,
												}}
												sx={{ flex: 1 }}
											>
												{modifier_icon !== undefined ? (
													<MenuItem value={modifier_icon}>{getIconLabelByName(modifier_icon)}</MenuItem>
												) : (
													<MenuItem />
												)}
											</TextField>

											<IconButton color="default" onClick={onClearIconModifier}>
												<ClearIcon />
											</IconButton>
										</Paper>
									</FormGroup>

									{errors.modifier_icon && <FormHelperText error>{errors.modifier_icon.message}</FormHelperText>}
								</FormControl>
								<FormControl fullWidth={true} component="fieldset" variant="outlined">
									<FormLabel component="legend" sx={{ mb: 1 }}>
										Modifier Colour and Opacity
									</FormLabel>
								</FormControl>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										paddingLeft: '8px',
										paddingRight: '8px',
										marginBottom: '24px',
									}}
								>
									<FormControl
										fullWidth={true}
										sx={{
											width: 'calc(30%)',
										}}
										component="fieldset"
										variant="outlined"
									>
										<FormGroup>
											<input type="color" className="colourPicker" {...register('modifier_colour')} />
										</FormGroup>

										{errors.modifier_colour && <FormHelperText error>{errors.modifier_colour.message}</FormHelperText>}
									</FormControl>

									<FormControl
										fullWidth={true}
										sx={{
											width: 'calc(70%)',
										}}
										component="fieldset"
										variant="outlined"
									>
										<FormGroup>
											<Controller
												name="modifier_opacity"
												control={control}
												render={({ field }) => (
													<SliderFixed
														{...field}
														valueLabelDisplay="auto"
														min={symbolMinimumOpacity}
														max={symbolMaximumOpacity}
														track={false}
														step={0.1}
														marks={[
															{
																value: 0,
																label: '0',
															},
															{
																value: 0.25,
																label: '0.25',
															},
															{
																value: 0.5,
																label: '0.5',
															},
															{
																value: 0.75,
																label: '0.75',
															},
															{
																value: 1,
																label: '1',
															},
														]}
													/>
												)}
											/>
										</FormGroup>

										{errors.modifier_opacity && (
											<FormHelperText error>{errors.modifier_opacity.message}</FormHelperText>
										)}
									</FormControl>
								</div>{' '}
							</React.Fragment>
						)}

						<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
							<BottomNavigation showLabels value={navigationValue} onChange={onChangeBottomNavigation}>
								<BottomNavigationAction
									label="Primary Icon"
									icon={
										Object.keys(errors).length === 0 ? (
											<ImageIcon />
										) : (
											<Badge badgeContent={'!'} color="error">
												<ImageIcon />
											</Badge>
										)
									}
								/>
								<BottomNavigationAction label="Modifier Icon" icon={<AddPhotoAlternateIcon />} />
							</BottomNavigation>
						</Paper>
					</Paper>
				</form>
			</DialogWithTransition>

			{isAddingGroup === true && (
				<SchemaSymbologyGroupEditor onDone={onDoneAddingGroup} onCancel={onCancelAddingGroup} />
			)}
		</React.Fragment>
	);
}

export default SymbologyFieldEditorEntrypoint;
