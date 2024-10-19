import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FlightIcon from '@mui/icons-material/Flight';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	AppBar,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import { isEqual } from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';
import type { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { type FeatureDataItem, type MapaFeature, type NewMapaFeature, useDeleteFeatureMutation } from '../../app/services/features';
import { usePatchMapMutation } from '../../app/services/maps';
import { FeatureSchemaFieldType } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import DiscardChangesDialog from '../../app/ui/discardChangesDialog';
import FormSectionHeading from '../../app/ui/formSectionHeading';
import { mapaThemeSecondaryBlue } from '../../app/ui/theme';
import SchemaDataEntrySymbology from '../schemaFields/SchemaSymbology/schemaDataEntrySymbology';
import SchemaFieldDataEntryManager, {
	type SchemaFieldDataEntryManagerTouchedFields,
	type SchemaFormFieldsFormValues,
} from '../schemaFields/schemaFieldDataEntryManager';
import SchemaFieldSummaryPanel from '../schemaFields/schemaFieldSummaryPanel';
import { SchemaEditor } from '../schemas/schemaEditor';
import { getFieldFromSchemaDefinitionById } from '../schemas/schemaHelpers';
import SchemaSelectFormControls from '../schemas/schemaSelectFormControls';
import { getSchemasAvailableForMap, selectFeatureSchemaById } from '../schemas/schemasSlice';

interface Props {
	mapId: number;
	feature: MapaFeature | NewMapaFeature;
	isFeatureSaving: boolean;
	onDoneAdding?: (feature: NewMapaFeature) => void;
	onDoneEditing?: (feature: MapaFeature) => void;
}

function FeatureForm(props: Props) {
	const navigate = useNavigate();

	const { mapId, feature, isFeatureSaving, onDoneAdding, onDoneEditing } = props;

	const [localFeature, setLocalFeature] = useState(feature);

	const [patchMap] = usePatchMapMutation();

	// IMPORTANT NOTE:
	// This is different to our usual pattern of relying on isDeleteFeatureSuccessful to trigger the next action once the feature has been
	// deleted from the backend.
	// Why is that?
	// Well, after much investigation and digging it all makes a lot of logical sense! With pessimistic updates we remove the feature from
	// the Redux store as soon as the query returns a response. However, because this FeatureForm component is inside FeatureEditor, and
	// because FeatureEditor is hooked up to the Redux store, FeatureForm gets unmounted as soon as the feature is removed fron the Redux store,
	// so it's never around to receive the completed query response and see isDeleteFeatureSuccessful === true.
	// Instead, we rely on attaching an onfulfilled .then() listener to deleteFeature() directly, so we can still take the 'navigate away' action.
	//
	// Ref tickets: #503 and #53
	//
	// Further:
	// Deleting features uses Redux Toolkit's pessimistic update pattern as a performance boost for users on poor quality mobile connections.
	// The API request and response for deleting a feature already contain the data we need to amend in the Redux store.
	// This let's us avoid having to refetch potentially thousands of features each time when only one has been modified.
	const [
		deleteFeature,
		/*{
			isSuccess: isDeleteFeatureSuccessful
		},*/
	] = useDeleteFeatureMutation();

	const [schemaIdForEditing, setSchemaIdForEditing] = useState<number | undefined>();

	const onEditSchema = (schemaId: number) => {
		setSchemaIdForEditing(schemaId);
	};

	const onDoneEditingSchema = () => {
		setSchemaIdForEditing(undefined);
	};

	const availableSchemas = useAppSelector((state) => getSchemasAvailableForMap(state, mapId));

	// If we've only got one schema, let's just choose it.
	// Note: We do this here, as well as on feature creation, to handle first time users who don't have any schemas at all when they create their feature.
	useEffect(() => {
		if (localFeature.schema_id === null && availableSchemas.length === 1) {
			setLocalFeature({
				...localFeature,
				schema_id: availableSchemas[0].id,
				data: [],
			});
		}
	}, [availableSchemas, localFeature]);

	// ######################
	// Schema Stuff
	// ######################
	const onChooseSchema = (schemaId: number | null) => {
		setLocalFeature({
			...localFeature,
			schema_id: schemaId,
			symbol_id: null,
			data: [],
		});
	};

	const schema = useAppSelector((state) => {
		if (localFeature.schema_id !== null) {
			return selectFeatureSchemaById(state, localFeature.schema_id);
		}
	});
	// ######################
	// Schema Stuff (End)
	// ######################

	// ######################
	// Manage Symbols
	// ######################
	const onSymbolChange = (symbolId: number) => {
		setLocalFeature({
			...localFeature,
			symbol_id: symbolId,
		});
	};

	const onSymbolRemove = () => {
		setLocalFeature({
			...localFeature,
			symbol_id: null,
		});
	};
	// ######################
	// Manage Symbols (End)
	// ######################

	// ######################
	// Schema Fields Form
	// ######################
	const handleSubmitRef = useRef<UseFormHandleSubmit<SchemaFormFieldsFormValues>>();
	const touchedFieldsRef = useRef<Partial<Readonly<SchemaFieldDataEntryManagerTouchedFields>> | undefined>();

	const onSave = () => {
		// The feature has a schema with some fields defined
		if (handleSubmitRef.current !== undefined) {
			handleSubmitRef.current(onDoneWithForm)();
		} else {
			// The feature has no schema, or has a schema with no
			// fields, so we can disregard processing the schema form
			onSaveAndCreateOrUpdateFeature(localFeature);
		}
	};

	const onDoneWithForm: SubmitHandler<SchemaFormFieldsFormValues> = (data) => {
		// If there's no schema, there's no fields to process, so just go ahead and update.
		// I think it's impossible to have no schema on a feature now, but maybe first time users can?
		if (schema === undefined) {
			onSaveAndCreateOrUpdateFeature(updateFeatureDataFromForm(localFeature, {}));
			return;
		}

		// We want to filter out any fields with values matching the default
		// values stored on the schema, so that we fall back to them correctly.
		// Note: We used to use touchedFieldsRef as part of this, but there's a
		// Safari bug with checkboxes not showing up as a touched field, so we
		// abandoned that and fixed it with changes here.
		// Now we only used touchedFieldsRef to handle keeping empty fields in
		// the filtered data items.
		const dataFiltered: SchemaFormFieldsFormValues = {};

		Object.entries(data).forEach(([fieldName, fieldValue]) => {
			const fieldId = Number(fieldName.split('_')[2]); // schema_field_[number]
			const schemaField = getFieldFromSchemaDefinitionById(schema, fieldId);

			if (schemaField !== undefined && fieldValue !== schemaField?.default_value) {
				// This handles the oddities of DatePicker and react-hook-form (ref: SchemaDataEntryDateField) and ensures that
				// we don't save an empty string when the user clears the field. (Unless we need to, e.g. where there's a default
				// value and we want to clear it - that's taken care of in the two sections below.)
				if (schemaField?.type === FeatureSchemaFieldType.DateField) {
					if (fieldValue !== '') {
						dataFiltered[fieldName] = fieldValue;
					}
				} else if (schemaField?.type === FeatureSchemaFieldType.URLField) {
					// Only include URLFields that have values, otherwise we'lll be saving an empty array on URLFields that aren't required
					if (Array.isArray(fieldValue) && fieldValue.length > 0) {
						dataFiltered[fieldName] = fieldValue;
					}
				} else {
					dataFiltered[fieldName] = fieldValue;
				}
			}
		});

		// This ensures that when a field is touched, and it's value is set to an empty string, that it actually gets
		// included in the data.
		// ReactHookForm, rightly, doesn't include it in the `data` from the form because most forms don't care about
		// a field that is blank.
		Object.entries(touchedFieldsRef.current || {}).forEach(([fieldName /*, wasTouched*/]) => {
			const fieldId = Number(fieldName.split('_')[2]); // schema_field_[number]
			const schemaField = getFieldFromSchemaDefinitionById(schema, fieldId);

			if (
				dataFiltered[fieldName] === undefined &&
				schemaField !== undefined &&
				(schemaField?.type === FeatureSchemaFieldType.TextField ||
					schemaField?.type === FeatureSchemaFieldType.DateField) &&
				schemaField?.default_value !== '' &&
				data[fieldName] !== schemaField?.default_value
			) {
				dataFiltered[fieldName] = '';
			}
		});

		// And this ensures that, if the item is already saved as an empty string on the feature, but the user
		// hasn't touched the field this time, that it's still included in the data being saved.
		Object.values(localFeature.data).forEach((data) => {
			const fieldName = `schema_field_${data.schema_field_id}`;
			const schemaField = getFieldFromSchemaDefinitionById(schema, data.schema_field_id);

			if (
				dataFiltered[fieldName] === undefined &&
				schemaField !== undefined &&
				(schemaField?.type === FeatureSchemaFieldType.TextField ||
					schemaField?.type === FeatureSchemaFieldType.DateField) &&
				schemaField?.default_value !== '' &&
				data.value === ''
			) {
				dataFiltered[fieldName] = '';
			}
		});

		onSaveAndCreateOrUpdateFeature(updateFeatureDataFromForm(localFeature, dataFiltered));
	};

	const updateFeatureDataFromForm = (feature: MapaFeature | NewMapaFeature, data: SchemaFormFieldsFormValues) => {
		const featureData: FeatureDataItem[] = [];

		// Rebuild the feature's data from the contents of the form.
		// This neatly handles additions, modifications, and deletions
		// whilst avoiding the need to manually handle those separately
		// like we were before.
		Object.entries(data).forEach(([schemaFieldName, schemaFieldValue]) => {
			featureData.push({
				value: schemaFieldValue,
				schema_field_id: Number(schemaFieldName.replace('schema_field_', '')),
			});
		});

		return {
			...feature,
			data: featureData,
		};
	};

	const onSaveAndCreateOrUpdateFeature = (feature: MapaFeature | NewMapaFeature) => {
		if (onDoneAdding !== undefined) {
			const featureData: NewMapaFeature = { ...feature };
			onDoneAdding(featureData);
		} else if ('id' in feature && onDoneEditing !== undefined) {
			const featureData: MapaFeature = { ...feature };
			onDoneEditing(featureData);
		}

		if (feature.schema_id !== null) {
			patchMap({
				id: mapId,
				last_used_schema_id: feature.schema_id,
			});
		}
	};
	// ######################
	// Schema Fields Form (End)
	// ######################

	// ######################
	// Delete Feature
	// ######################
	const [isDeletingFeature, setIsDeletingFeature] = useState(false);

	const onClickDeleteFeature = () => setIsDeletingFeature(true);

	const onDeleteFeature = () => {
		if ('id' in feature) {
			// See note above about how we're not using isDeleteFeatureSuccessful
			deleteFeature(feature.id).then(() => navigate('/'));
		}
	};

	const onCancelDeleteFeature = () => setIsDeletingFeature(false);
	// ######################
	// Delete Feature (End)
	// ######################

	// ######################
	// Overall Component
	// ######################
	const isDirtyRef = useRef<boolean>();

	const onClose = () => navigate(-1);

	const onCancelForEditor = () => {
		if (isEqual(feature, localFeature) === false || isDirtyRef.current === true) {
			setIsDiscardChangesDialogShown(true);
		} else {
			onClose();
		}
	};

	const [isDiscardChangesDialogShown, setIsDiscardChangesDialogShown] = useState(false);

	const onConfirmDiscardChanges = () => onClose();

	const onCancelDiscardChangesDialog = () => setIsDiscardChangesDialogShown(false);
	// ######################
	// Overall Component (End)
	// ######################

	return (
		<React.Fragment>
			{isDiscardChangesDialogShown === true && (
				<DiscardChangesDialog onNo={onCancelDiscardChangesDialog} onYes={onConfirmDiscardChanges} />
			)}

			{isDeletingFeature === true && (
				<Dialog open={true} onClose={onCancelDeleteFeature} fullWidth>
					<DialogTitle>Delete feature?</DialogTitle>
					<DialogActions>
						<Button onClick={onCancelDeleteFeature}>No</Button>
						<Button onClick={onDeleteFeature}>Yes</Button>
					</DialogActions>
				</Dialog>
			)}

			<DialogWithTransition
			// For some reason this was causing the dialog to close as soon as it opened when the feature had no schema selected
			// onClose={onCancelForEditor}
			>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onCancelForEditor}>
							<CloseIcon />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							{onDoneAdding !== undefined ? 'Add Feature' : 'Edit Feature'}
						</Typography>

						<LoadingButton loading={isFeatureSaving} color="inherit" onClick={onSave}>
							{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
							<span>Save</span>
						</LoadingButton>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3, mt: 2 }}>
					{/* Don't display the feature summary when we're adding a feature - this just ensure we don't show it in the case when the feature already has data fields populated (e.g. In some Google Maps import scenarios) */}
					{onDoneAdding === undefined && localFeature.data.length >= 1 && (
						<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
							<FormSectionHeading>Feature Summary</FormSectionHeading>

							{localFeature.schema_id !== null && (
								<SchemaFieldSummaryPanel schemaId={localFeature.schema_id} feature={localFeature} />
							)}
						</FormControl>
					)}

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormSectionHeading marginBottom={2}>Schema</FormSectionHeading>

						<SchemaSelectFormControls
							mapId={mapId}
							selectedSchemaId={localFeature.schema_id || undefined}
							onChooseSchema={onChooseSchema}
							onClickEditSchema={onEditSchema}
						/>
					</FormControl>

					{localFeature.schema_id !== null && (
						<React.Fragment>
							<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
								<FormSectionHeading marginBottom={2}>Symbology</FormSectionHeading>

								<SchemaDataEntrySymbology
									mapId={mapId}
									schemaId={localFeature.schema_id}
									symbolId={localFeature.symbol_id}
									onFieldChange={onSymbolChange}
									onFieldRemove={onSymbolRemove}
								/>
							</FormControl>

							<SchemaFieldDataEntryManager
								schemaId={localFeature.schema_id}
								feature={localFeature}
								handleSubmitRef={handleSubmitRef}
								touchedFieldsRef={touchedFieldsRef}
								isDirtyRef={isDirtyRef}
							/>
						</React.Fragment>
					)}

					{onDoneEditing !== undefined && (
						<FormControl sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<Grid container direction="column" sx={{ mt: 1, mb: 2 }}>
								<Grid container direction="row" alignItems="center">
									<Grid item sx={{ mr: 0.5, flexGrow: 1 }}>
										<FormSectionHeading>Danger Zone</FormSectionHeading>
									</Grid>
									<Grid item>
										<FlightIcon
											sx={{
												verticalAlign: 'top',
												color: mapaThemeSecondaryBlue,
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
								onClick={onClickDeleteFeature}
								sx={{ maxWidth: 350 }}
							>
								Delete
							</Button>
						</FormControl>
					)}
				</Paper>

				{schemaIdForEditing !== undefined && (
					<DialogWithTransition onClose={onCancelForEditor}>
						<SchemaEditor
							schemaId={schemaIdForEditing}
							onDoneEditingSchema={onDoneEditingSchema}
							onCancelEditing={onDoneEditingSchema}
						/>
					</DialogWithTransition>
				)}
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default FeatureForm;
