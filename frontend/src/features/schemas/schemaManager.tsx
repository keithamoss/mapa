import CloseIcon from '@mui/icons-material/Close';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import {
	Alert,
	AppBar,
	Button,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Snackbar,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { usePatchMapMutation } from '../../app/services/maps';
import { FeatureSchema, FeatureSchemaModifiableProps, useAddFeatureSchemaMutation } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import SwipeableListItem from '../../app/ui/swipeableListItem/swipeableListItem';
import { isTouchDevice } from '../../app/utils';
import { selectActiveMapId } from '../app/appSlice';
import { selectMapById } from '../maps/mapsSlice';
import SchemaForkingNameChooser from './schemaForkingNameChooser';
import { selectAllFeatureSchemas } from './schemasSlice';

function SchemaManager() {
	const schemas = useAppSelector(selectAllFeatureSchemas);

	const navigate = useNavigate();

	const mapId = useAppSelector(selectActiveMapId);
	const map = useAppSelector((state) => (mapId !== undefined ? selectMapById(state, mapId) : undefined));

	const onClickSchema = (schemaId: number) => () => navigate(`/SchemaManager/Edit/${schemaId}/`);

	const onClose = () => navigate('/');

	const onCreate = () => navigate('/SchemaManager/Create');

	// ######################
	// Fork Schema
	// ######################
	const [schemaToFork, setSchemaToFork] = useState<FeatureSchema>();

	const onForkSchema = (schema: FeatureSchema) => () => {
		setTimeout(() => {
			setSchemaToFork(schema);
		}, 250);
	};

	const [addSchema] = useAddFeatureSchemaMutation();
	const [patchMap] = usePatchMapMutation();

	const onDoneForkingSchema = async (schemaName: string) => {
		if (schemaToFork !== undefined) {
			const forkedSchema: FeatureSchemaModifiableProps = {
				name: schemaName,
				definition: schemaToFork.definition,
				symbology: schemaToFork.symbology,
				default_symbology: schemaToFork.default_symbology,
			};

			const newSchema = await addSchema(forkedSchema).unwrap();

			if (mapId !== undefined && map !== undefined) {
				patchMap({
					id: mapId,
					available_schema_ids: [...map.available_schema_ids, newSchema.id],
				});

				setIsSnackbarOpen(true);
			}

			setSchemaToFork(undefined);
		}
	};

	const onCancelForkingSchema = () => {
		setSchemaToFork(undefined);
	};
	// ######################
	// Fork Schema (End)
	// ######################

	// ######################
	// Schema Forked Snackbar
	// ######################
	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

	const handleSnackbarClose = () => {
		setIsSnackbarOpen(false);
	};
	// ######################
	// Schema Forked Snackbar (End)
	// ######################

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Schemas
					</Typography>
					<Button color="inherit" onClick={onCreate}>
						Create
					</Button>
				</Toolbar>
			</AppBar>

			{/* overflow-x here prevents the slight scaling we apply to the ListItems
			from briefly showing a horizontal scrollbar */}
			<List style={{ overflowX: 'hidden' }}>
				{schemas.map((schema) => (
					<React.Fragment key={schema.id}>
						{isTouchDevice() === false ? (
							<ListItem
								secondaryAction={
									<IconButton edge="end" sx={{ mr: 1, backgroundColor: 'whitesmoke' }} onClick={onForkSchema(schema)}>
										<ForkRightIcon />
									</IconButton>
								}
							>
								<ListItemButton onClick={onClickSchema(schema.id)}>
									<ListItemText primary={schema.name} />
								</ListItemButton>
							</ListItem>
						) : (
							<SwipeableListItem
								schema={schema}
								onClick={onClickSchema(schema.id)}
								onActionTriggered={onForkSchema(schema)}
							/>
						)}

						<Divider />
					</React.Fragment>
				))}
			</List>

			<Snackbar open={isSnackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
				<Alert severity="info" sx={{ width: '100%' }}>
					Schema forked
				</Alert>
			</Snackbar>

			{schemaToFork !== undefined && (
				<SchemaForkingNameChooser
					name={`${schemaToFork.name} (Forked)`}
					onDone={onDoneForkingSchema}
					onCancel={onCancelForkingSchema}
				/>
			)}
		</DialogWithTransition>
	);
}

export default SchemaManager;
