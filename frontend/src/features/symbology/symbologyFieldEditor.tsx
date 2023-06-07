import AddCircleIcon from '@mui/icons-material/AddCircle';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';

import { yupResolver } from '@hookform/resolvers/yup';
import {
	AppBar,
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
	Typography,
} from '@mui/material';

import { isEmpty, pickBy } from 'lodash-es';
import React, { useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { stopPropagate } from '../../app/forms/formUtils';
import {
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
	defaultSymbologyGroupId,
	getAppDefaultSymbologyConfig,
	getFontAwesomeIconForSymbolPreview,
	getFontAwesomeIconFromLibraryAsSVGImage,
} from './symbologyHelpers';

// eslint-disable-next-line import/named
import { IconFamily, IconStyle } from '@fortawesome/fontawesome-svg-core';
import { DialogWithTransition } from '../../app/ui/dialog';
import DiscardChangesDialog from '../../app/ui/discardChangesDialog';
import SchemaSymbologyGroupEditor from '../schemas/schemaSymbologyGroupEditor';
import './colourPicker.css';
import {
	getDefaultFamilyByIconName,
	getDefaultStyleByIconName,
	getIconFamilyAndStyleName,
	getIconLabelByName,
} from './font-awesome/fontAwesome';
import SliderFixed from './sliderFixed';
import SymbologyIconChooser from './symbologyIconChooser';
import SymbologyIconFamilyAndStyleChooser from './symbologyIconFamilyAndStyleChooser';

const getDefaultValues = (symbol: SymbologyProps | null | undefined) => {
	const icon = getStringOrDefaultForSymbologyField(symbol, 'icon', defaultSymbolIcon);

	const defaultValues = {
		name: getStringOrEmptyStringForSymbologyField(symbol, 'name'),
		icon,
		icon_family: getStringOrDefaultForSymbologyField(symbol, 'icon_family', getDefaultFamilyByIconName(icon)),
		icon_style: getStringOrDefaultForSymbologyField(symbol, 'icon_style', getDefaultStyleByIconName(icon)),
		colour: getStringOrDefaultForSymbologyField(symbol, 'colour', defaultSymbolColour),
		opacity: getNumberOrDefaultForSymbologyField(symbol, 'opacity', defaultSymbolOpacity),
		secondary_colour: getStringOrDefaultForSymbologyField(symbol, 'secondary_colour', defaultSymbolSecondaryColour),
		secondary_opacity: getNumberOrDefaultForSymbologyField(symbol, 'secondary_opacity', defaultSymbolSecondaryOpacity),
		modifier_icon: getStringOrUndefinedForSymbologyField(symbol, 'modifier_icon'),
		modifier_colour: getStringOrDefaultForSymbologyField(symbol, 'modifier_colour', defaultSymbolColour),
		modifier_opacity: getNumberOrDefaultForSymbologyField(symbol, 'modifier_opacity', defaultSymbolOpacity),
		size: getNumberOrDefaultForSymbologyField(symbol, 'size', defaultSymbolSize),
		rotation: getNumberOrDefaultForSymbologyField(symbol, 'rotation', defaultSymbolRotation),
	};

	return pickBy(defaultValues, (v) => v !== undefined);
};

export const getAppDefaultSymbologyConfigForForm = () => {
	const defaults = getAppDefaultSymbologyConfig();

	// This UI is all about choosing an icon, so we don't want
	// to delete any defaults props about the icon itself
	delete defaults.icon;
	delete defaults.icon_family;
	delete defaults.icon_style;

	return defaults;
};

const removeDefaultValuesFromForm = (data: SymbologyProps, nameFieldRequired: boolean, iconFieldRequired: boolean) => {
	const defaults = getAppDefaultSymbologyConfigForForm();

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

	if (data.icon_family !== 'duotone') {
		delete data.secondary_colour;
		delete data.secondary_opacity;
	}

	if (data.modifier_icon === undefined) {
		delete data.modifier_icon;
		delete data.modifier_colour;
		delete data.modifier_opacity;
	}

	console.log('🚀 ~ file: symbologyFieldEditor.tsx:138 ~ removeDefaultValuesFromForm ~ data:', data);
	return data;
};

interface Props {
	symbol?: SymbologyProps | null;
	onDone: (symbolField: SymbologyProps, groupId: number) => void;
	onCancel: () => void;
	groups?: FeatureSchemaSymbologyGroup[];
	onAddGroup?: (groupName: string) => number;
	currentGroupId?: number;
	nameFieldRequired: boolean;
	iconFieldRequired: boolean;
}

function SymbologyFieldEditor(props: Props) {
	const { symbol, onDone, onCancel, groups, onAddGroup, currentGroupId, nameFieldRequired, iconFieldRequired } = props;

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
		defaultValues: getDefaultValues(symbol),
	});

	const {
		icon,
		icon_family,
		icon_style,
		colour,
		opacity,
		secondary_colour,
		secondary_opacity,
		modifier_icon,
		modifier_colour,
		modifier_opacity,
		size,
		rotation,
	} = watch();
	console.log('🚀 ~ file: symbologyFieldEditor.tsx:184 ~ SymbologyFieldEditor ~ modifier_icon:', modifier_icon);

	const textInput = useRef<HTMLInputElement>(null);

	const onDoneWithForm: SubmitHandler<SymbologyProps> = (data) => {
		const dataWithDefaultsRemoved = removeDefaultValuesFromForm(data, nameFieldRequired, iconFieldRequired);

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
	// Icon Chooser Dialog
	// ######################
	const [isIconChooserOpen, setIsIconChooserOpen] = useState(false);

	const onOpenIconChooser = () => setIsIconChooserOpen(true);

	const onChooseIconFromIconChooser = (icon: string, icon_family: string, icon_style: string) => {
		setValue('icon', icon, { shouldDirty: true });
		setValue('icon_family', icon_family, { shouldDirty: true });
		setValue('icon_style', icon_style, { shouldDirty: true });
		setIsIconChooserOpen(false);
	};

	const onCloseSymbologyIconChooser = () => setIsIconChooserOpen(false);
	// ######################
	// Icon Chooser Dialog (End)
	// ######################

	// ######################
	// Icon Family and Style Choosing
	// ######################
	const [isIconFamilyAndStyleChooserOpen, setIsIconFamilyAndStyleChooserOpen] = useState(false);

	const onOpenIconFamilyAndStyleChooser = () => setIsIconFamilyAndStyleChooserOpen(true);

	const onChooseIconFamilyAndStyle = (icon_family: string, icon_style: string) => {
		setValue('icon_family', icon_family, { shouldDirty: true });
		setValue('icon_style', icon_style, { shouldDirty: true });
		setIsIconFamilyAndStyleChooserOpen(false);
	};

	const onCloseFamilyAndStyleChooser = () => setIsIconFamilyAndStyleChooserOpen(false);
	// ######################
	// Icon Family and Style Choosing (End)
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

			{isIconFamilyAndStyleChooserOpen === true && icon !== undefined && (
				<SymbologyIconFamilyAndStyleChooser
					selectedIcon={icon}
					onChoose={onChooseIconFamilyAndStyle}
					onClose={onCloseFamilyAndStyleChooser}
				/>
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

				<form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
					<Paper elevation={0} sx={{ m: 3 }}>
						<Paper variant="outlined" sx={{ textAlign: 'center', mb: 1, pt: 2, pb: 2 }}>
							{symbol !== null &&
								getFontAwesomeIconForSymbolPreview({
									...symbol,
									icon,
									icon_family,
									icon_style,
									colour,
									opacity,
									secondary_colour,
									secondary_opacity,
									modifier_icon,
									modifier_colour,
									modifier_opacity,
									size: (size !== undefined ? size : defaultSymbolSizeForFormFields) * 2,
									rotation,
								})}
						</Paper>

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

						<FormControl
							fullWidth={true}
							sx={{ mb: 3, mt: nameFieldRequired !== false ? 0 : 1 }}
							component="fieldset"
							variant="outlined"
						>
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
									value={icon_family !== undefined && icon_style !== undefined ? `${icon_family}_${icon_style}` : ''}
									SelectProps={{
										open: false,
										onClick: onOpenIconFamilyAndStyleChooser,
									}}
									InputProps={{
										startAdornment:
											icon !== undefined && icon_family !== undefined && icon_style !== undefined ? (
												<InputAdornment position="start" sx={{ mr: 1 }}>
													{getFontAwesomeIconFromLibraryAsSVGImage(icon, icon_family, icon_style)}
												</InputAdornment>
											) : undefined,
									}}
								>
									{icon_family !== undefined && icon_style !== undefined ? (
										<MenuItem value={`${icon_family}_${icon_style}`}>
											{getIconFamilyAndStyleName(icon_family as IconFamily, icon_style as IconStyle)}
										</MenuItem>
									) : (
										<MenuItem />
									)}
								</TextField>
							</FormGroup>

							{errors.icon_family && <FormHelperText error>{errors.icon_family.message}</FormHelperText>}

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
						</div>

						{icon_family === 'duotone' && (
							<React.Fragment>
								<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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
														{getFontAwesomeIconFromLibraryAsSVGImage(modifier_icon, 'solid', 'classic')}
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

								{errors.modifier_opacity && <FormHelperText error>{errors.modifier_opacity.message}</FormHelperText>}
							</FormControl>
						</div>

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

						<FormControl fullWidth={true} sx={{ mb: 3, pl: 1, pr: 1 }} component="fieldset" variant="outlined">
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
					</Paper>
				</form>
			</DialogWithTransition>

			{isAddingGroup === true && (
				<SchemaSymbologyGroupEditor onDone={onDoneAddingGroup} onCancel={onCancelAddingGroup} />
			)}
		</React.Fragment>
	);
}

export default SymbologyFieldEditor;
