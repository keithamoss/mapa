import DeleteIcon from '@mui/icons-material/Delete';
import FlightIcon from '@mui/icons-material/Flight';
import TuneIcon from '@mui/icons-material/Tune';

import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
	Alert,
	AlertTitle,
	AppBar,
	Button,
	ButtonGroup,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormGroup,
	FormHelperText,
	FormLabel,
	Grid,
	IconButton,
	Paper,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { schemaFormValidationSchema } from '../../app/forms/schemaForm';
import { useAppSelector } from '../../app/hooks/store';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionCollection,
	FeatureSchemaFieldType,
	FeatureSchemaFieldTypeLabel,
	FeatureSchemaModifiableProps,
	FeatureSchemaSymbologySymbolsValue,
	NewFeatureSchema,
	NewFeatureSchemaFieldDefinitionCollection,
	SymbologyProps,
} from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import DiscardChangesDialog from '../../app/ui/discardChangesDialog';
import { selectActiveMapId } from '../app/appSlice';
import SchemaFieldCreatorAndEditor from '../schemaFields/schemaFieldCreatorAndEditor';
import SchemaFieldListManager from '../schemaFields/schemaFieldListManager';
import SymbologyFieldEditor from '../symbology/symbologyFieldEditor';
import {
	addNewSymbologyGroup,
	addSymbolToGroup,
	defaultSymbologyGroupId,
	deleteSymbologyGroup,
	editSymbologyGroup,
	favouriteSymbolForMap,
	modifySymbolInGroup,
	moveSymbolsToGroup,
	removeSymbol,
	unfavouriteSymbolForMap,
} from '../symbology/symbologyHelpers';
import { getNextSchemaFieldId } from './schemasSlice';
import SchemaSymbologyManager from './schemaSymbologyManager';

interface Props {
	schema?: FeatureSchema;
	onDoneAdding?: (schema: NewFeatureSchema) => void;
	onDoneEditing?: (schema: FeatureSchema) => void;
	onCancel?: () => void;
}

function SchemaForm(props: Props) {
	const navigate = useNavigate();

	const mapId = useAppSelector(selectActiveMapId);

	const { schema, onDoneAdding, onDoneEditing, onCancel } = props;

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<FeatureSchemaModifiableProps>({
		resolver: yupResolver(schemaFormValidationSchema),
		defaultValues: {
			name: schema?.name || '',
			symbology: schema?.symbology || {
				groups: [
					{
						id: defaultSymbologyGroupId,
						name: 'Default',
					},
				],
				symbols: [],
			},
			default_symbology: schema?.default_symbology || undefined,
			definition: schema?.definition,
		},
	});

	const { symbology, default_symbology, definition } = watch();

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
	// Symbology
	// ######################
	const onAddSymbolGroup = (groupName: string) => {
		const { id, symbology: local_symbology } = addNewSymbologyGroup(groupName, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });

		return id;
	};

	const onEditSymbolGroup = (groupId: number, groupName: string) => {
		const local_symbology = editSymbologyGroup(groupId, groupName, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};

	const onDeleteSymbolGroup = (groupId: number) => {
		const local_symbology = deleteSymbologyGroup(groupId, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};

	const onAddSymbol = (symbol: SymbologyProps, groupId: number) => {
		const [local_symbology] = addSymbolToGroup(symbol, symbology, groupId);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};

	const onEditSymbol = (symbol: FeatureSchemaSymbologySymbolsValue) => {
		const local_symbology = modifySymbolInGroup(symbol, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};

	const onDeleteSymbol = (symbolId: number) => {
		const local_symbology = removeSymbol(symbolId, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};

	const onFavouriteSymbol = (symbolId: number) => {
		if (mapId !== undefined) {
			const local_symbology = favouriteSymbolForMap(symbolId, mapId, symbology);
			setValue('symbology', local_symbology, { shouldDirty: true });
		}
	};

	const onUnfavouriteSymbol = (symbolId: number) => {
		if (mapId !== undefined) {
			const local_symbology = unfavouriteSymbolForMap(symbolId, mapId, symbology);
			setValue('symbology', local_symbology, { shouldDirty: true });
		}
	};

	const onRearrangeSymbolsToGroup = (symbolIds: number[], groupId: number) => {
		const local_symbology = moveSymbolsToGroup(symbolIds, groupId, symbology);
		setValue('symbology', local_symbology, { shouldDirty: true });
	};
	// ######################
	// Symbology (End)
	// ######################

	// ######################
	// Fields
	// ######################
	const [isAddFieldTypeChooserOpen, setIsAddFieldTypeChooserOpen] = useState(false);

	const onClickAddField = () => {
		setIsAddFieldTypeChooserOpen(true);
	};

	const onChooseFieldTypeToAdd = (field_type: FeatureSchemaFieldType) => () => {
		setFieldTypeToAdd(field_type);
	};

	const onCancelChooseFieldTypeToAdd = () => setIsAddFieldTypeChooserOpen(false);

	const [fieldTypeToAdd, setFieldTypeToAdd] = useState<FeatureSchemaFieldType | undefined>();

	const onDoneAddingField = (field: NewFeatureSchemaFieldDefinitionCollection) => {
		setValue(
			'definition',
			[
				...(definition || []),
				{
					...field,
					id: getNextSchemaFieldId(definition),
				} as FeatureSchemaFieldDefinitionCollection,
			],
			{ shouldDirty: true },
		);

		setFieldTypeToAdd(undefined);
		setIsAddFieldTypeChooserOpen(false);
	};

	const onCancelAddingField = () => setFieldTypeToAdd(undefined);

	const onFieldChange = (definition: FeatureSchemaFieldDefinitionCollection[]) => {
		setValue('definition', definition, { shouldDirty: true });
	};
	// ######################
	// Fields (End)
	// ######################

	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onDoneWithForm: SubmitHandler<FeatureSchemaModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			if (schema === undefined && onDoneAdding !== undefined) {
				const scheamData: NewFeatureSchema = { ...data };
				onDoneAdding(scheamData);
			} else if (schema !== undefined && onDoneEditing !== undefined) {
				const scheamData: FeatureSchema = { ...schema, ...data };
				onDoneEditing(scheamData);
			}
		}
	};

	const onClose = () => {
		if (onCancel === undefined) {
			navigate(-1);
		} else {
			onCancel();
		}
	};

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
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onCancelForm}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Schema
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
									You can set symbology defaults for this schema that replace the map&apos;s defaults. These will
									themselves be replaced by any symbology set by individual features.
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

							{errors.default_symbology && (
								<FormHelperText error>Errors: {errors.default_symbology.message}</FormHelperText>
							)}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormLabel component="legend" sx={{ mb: 1 }}>
								Symbols
							</FormLabel>

							<FormGroup>
								<SchemaSymbologyManager
									schemaId={schema?.id}
									symbology={symbology}
									mapId={mapId}
									onAddGroup={onAddSymbolGroup}
									onEditGroup={onEditSymbolGroup}
									onDeleteGroup={onDeleteSymbolGroup}
									onAddObject={onAddSymbol}
									onEditObject={onEditSymbol}
									onDeleteObject={onDeleteSymbol}
									onFavouriteSymbol={onFavouriteSymbol}
									onUnfavouriteSymbol={onUnfavouriteSymbol}
									onRearrangeSymbolsToGroup={onRearrangeSymbolsToGroup}
								/>
							</FormGroup>

							{errors.symbology && <FormHelperText error>{errors.symbology.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormLabel component="legend" sx={{ mb: 1 }}>
								Your Fields
							</FormLabel>

							<FormGroup>
								<Typography variant="body2">
									You can use fields to capture additional data about features or further customise their symbology.
								</Typography>

								<Button
									variant="outlined"
									startIcon={<TuneIcon />}
									onClick={onClickAddField}
									sx={{
										mt: 2,
										maxWidth: 350,
										mb: definition === undefined ? 2 : 0,
									}}
								>
									Add Field
								</Button>

								{definition !== undefined && (
									<SchemaFieldListManager
										schemaId={schema?.id}
										schemaDefinition={definition}
										onSchemaDefinitionChange={onFieldChange}
									/>
								)}

								<Alert severity="info">
									<AlertTitle>The order of these fields is important.</AlertTitle>
									Any symbology set by a field higher up in the list will have symbology set by later fields merged over
									the top of it.
									<br />
									<br />
									Likewise, symbology set by any fields will take precedence over symbology set by the map and the
									schema.
								</Alert>
							</FormGroup>

							{errors.definition && <FormHelperText error>{errors.definition.message}</FormHelperText>}
						</FormControl>

						{schema !== undefined && (
							<FormControl sx={{ mb: 3 }} component="fieldset" variant="outlined">
								<Grid container direction="column" sx={{ mt: 1, mb: 2 }}>
									<Grid container direction="row" alignItems="center">
										<Grid item sx={{ mr: 0.5, flexGrow: 1 }}>
											<FormLabel component="legend">Danger Zone</FormLabel>
										</Grid>
										<Grid item>
											<FlightIcon
												sx={{
													verticalAlign: 'middle',
													color: 'rgb(0, 0, 0)',
													opacity: 0.5,
													fontSize: '16px',
												}}
											/>
										</Grid>
									</Grid>
								</Grid>

								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon color="error" />}
									component={Link}
									to={`/SchemaManager/Delete/${schema.id}`}
									sx={{ maxWidth: 350 }}
								>
									Delete
								</Button>
							</FormControl>
						)}
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

			{isAddFieldTypeChooserOpen === true && (
				<DialogWithTransition
					onClose={onCancelChooseFieldTypeToAdd}
					dialogProps={{ fullScreen: false, fullWidth: true }}
				>
					<DialogTitle>Add Field</DialogTitle>
					<DialogContent>
						<ButtonGroup orientation="vertical" variant="outlined" fullWidth>
							{Object.values(FeatureSchemaFieldType).map((value) => (
								<Button key={value} onClick={onChooseFieldTypeToAdd(value)}>
									{FeatureSchemaFieldTypeLabel[value]}
								</Button>
							))}
						</ButtonGroup>
					</DialogContent>
					<DialogActions>
						<Button onClick={onCancelChooseFieldTypeToAdd}>Cancel</Button>
					</DialogActions>
				</DialogWithTransition>
			)}

			{fieldTypeToAdd !== undefined && (
				<SchemaFieldCreatorAndEditor
					fieldTypeToAdd={fieldTypeToAdd}
					onDoneAdding={onDoneAddingField}
					onCancel={onCancelAddingField}
				/>
			)}
		</React.Fragment>
	);
}

export default SchemaForm;
