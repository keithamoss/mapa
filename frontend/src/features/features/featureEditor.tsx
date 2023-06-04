import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FlightIcon from '@mui/icons-material/Flight';
import {
	AppBar,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	FormControl,
	FormLabel,
	Grid,
	IconButton,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import {
	Feature,
	FeatureDataItem,
	useDeleteFeatureMutation,
	useUpdateFeatureMutation,
} from '../../app/services/features';
import { usePatchMapMutation } from '../../app/services/maps';
import { usePatchFeatureSchemaMutation } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import NotFound from '../../NotFound';
import { selectActiveMapId } from '../app/appSlice';
import SchemaFieldDataEntryManager, { SchemaFormFieldsFormValues } from '../schemaFields/schemaFieldDataEntryManager';
import SchemaFieldSummaryPanel from '../schemaFields/schemaFieldSummaryPanel';
import SchemaDataEntrySymbology from '../schemaFields/SchemaSymbology/schemaDataEntrySymbology';
import { SchemaEditor } from '../schemas/schemaEditor';
import SchemaSelectFormControls from '../schemas/schemaSelectFormControls';
import { getSchemasAvailableForMap, selectFeatureSchemaById } from '../schemas/schemasSlice';
import { selectFeatureById } from './featuresSlice';

function FeatureEditorEntrypoint() {
	const params = useParams();
	const featureId = getIntegerParamOrUndefined(params, 'featureId');

	const mapId = useAppSelector(selectActiveMapId);

	if (featureId === undefined || mapId === undefined) {
		return <NotFound />;
	}

	return <FeatureEditorEntrypointLayer2 mapId={mapId} featureId={featureId} />;
}

function FeatureEditorEntrypointLayer2(props: { mapId: number; featureId: number }) {
	const { mapId, featureId } = props;

	const feature = useAppSelector((state) => selectFeatureById(state, featureId));

	if (feature !== undefined) {
		return <FeatureEditor mapId={mapId} feature={feature} />;
	}

	return null;
}

interface LocationState {
	isAdding?: boolean;
}

interface Props {
	mapId: number;
	feature: Feature;
}

function FeatureEditor(props: Props) {
	const navigate = useNavigate();

	const location = useLocation();
	const isAddingNewFeature = (location.state as LocationState)?.isAdding;

	const { mapId, feature } = props;

	const [localFeature, setLocalFeature] = useState(feature);

	const [
		updateFeature,
		{
			isSuccess: isUpdatingFeatureSuccessful,
			// isLoading: isUpdatingFeatureLoading,
		},
	] = useUpdateFeatureMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isUpdatingFeatureSuccessful === true) {
			navigate('/');
		}
	}, [isUpdatingFeatureSuccessful, navigate]);

	const [patchMap] = usePatchMapMutation();

	const [deleteFeature, { isSuccess: isDeleteFeatureSuccessful }] = useDeleteFeatureMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isDeleteFeatureSuccessful === true) {
			navigate('/');
		}
	}, [isDeleteFeatureSuccessful, navigate]);

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
			data: [],
		});
	};

	const [patchSchema] = usePatchFeatureSchemaMutation();

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
	const touchedFieldsRef = useRef<
		Partial<
			Readonly<{
				[x: string]: boolean;
			}>
		>
	>();

	const onSave = () => {
		// The feature has a schema with some fields defined
		if (handleSubmitRef.current !== undefined) {
			handleSubmitRef.current(onDoneWithForm)();
		} else {
			// The feature has no schema, or has a schema with no
			// fields, so we can disregard processing the schema form
			onSaveAndUpdateFeature(localFeature);
		}
	};

	const onDoneWithForm: SubmitHandler<SchemaFormFieldsFormValues> = (data) => {
		const featureDataSchemaFieldNames = localFeature.data.map(
			(featureDataItem) => `schema_field_${featureDataItem.schema_field_id}`,
		);

		// We want to filter out any fields with non-values so that
		// we fallback to the default values stored on the schema.
		// This largely means removing any fields that weren't touched
		// on the form (unless they already had a value saved on the feature).
		const dataFiltered: SchemaFormFieldsFormValues = {};

		Object.entries(data).forEach(([fieldName, fieldValue]) => {
			if (
				touchedFieldsRef.current === undefined ||
				touchedFieldsRef.current[fieldName] !== undefined ||
				featureDataSchemaFieldNames.includes(fieldName)
			) {
				dataFiltered[fieldName] = fieldValue;
			}
		});

		onSaveAndUpdateFeature(updateFeatureDataFromForm(localFeature, dataFiltered));
	};

	const updateFeatureDataFromForm = (feature: Feature, data: SchemaFormFieldsFormValues) => {
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

	const onSaveAndUpdateFeature = (feature: Feature) => {
		updateFeature(feature);

		if (feature.schema_id !== null) {
			patchMap({
				id: mapId,
				last_used_schema_id: feature.schema_id,
			});
		}

		if (isAddingNewFeature === true && schema !== undefined && feature.symbol_id !== null) {
			const recentlyUsedSymbols = { ...schema.recently_used_symbols };

			if (recentlyUsedSymbols[mapId] === undefined) {
				recentlyUsedSymbols[mapId] = [];
			}

			recentlyUsedSymbols[mapId] = [
				feature.symbol_id,
				...recentlyUsedSymbols[mapId].filter((id) => id != feature.symbol_id),
			].slice(0, 3);

			patchSchema({
				id: schema.id,
				recently_used_symbols: recentlyUsedSymbols,
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
		deleteFeature(feature.id);
	};

	const onCancelDeleteFeature = () => setIsDeletingFeature(false);
	// ######################
	// Delete Feature (End)
	// ######################

	// ######################
	// Overall Component
	// ######################
	const onCancelForEditor = () => {
		if (isAddingNewFeature === true) {
			deleteFeature(feature.id);
		} else {
			navigate(-1);
		}
	};
	// ######################
	// Overall Component (End)
	// ######################

	return (
		<React.Fragment>
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
							Edit Feature
						</Typography>
						<Button color="inherit" onClick={onSave}>
							Save
						</Button>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3, mt: 2 }}>
					{localFeature.data.length >= 1 && (
						<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
							<FormLabel component="legend">Feature Summary</FormLabel>

							{localFeature.schema_id !== null && (
								<SchemaFieldSummaryPanel schemaId={localFeature.schema_id} feature={localFeature} />
							)}
						</FormControl>
					)}

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormLabel component="legend" sx={{ mb: 2 }}>
							Schema
						</FormLabel>

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
								<FormLabel component="legend" sx={{ mb: 2 }}>
									Symbology
								</FormLabel>

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
							/>
						</React.Fragment>
					)}

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
							onClick={onClickDeleteFeature}
							sx={{ maxWidth: 350 }}
						>
							Delete
						</Button>
					</FormControl>
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

export default FeatureEditorEntrypoint;
