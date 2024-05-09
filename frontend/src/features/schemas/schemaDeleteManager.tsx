import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	Alert,
	AlertTitle,
	AppBar,
	FormControl,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { useDeleteSchemaMutation, useLazyCheckCanDeleteFeatureSchemaQuery } from '../../app/services/schemas';
import { DialogWithTransition } from '../../app/ui/dialog';
import { selectAllMaps } from '../maps/mapsSlice';

function SchemaDeleteManagerEntrypoint() {
	const params = useParams();
	const schemaId = getIntegerParamOrUndefined(params, 'schemaId');

	if (schemaId === undefined) {
		return <NotFound />;
	}

	return <SchemaDeleteManager schemaId={schemaId} />;
}

interface Props {
	schemaId: number;
}

function SchemaDeleteManager(props: Props) {
	const { schemaId } = props;

	const navigate = useNavigate();

	const maps = useAppSelector((state) => selectAllMaps(state));

	const [trigger, { isUninitialized, isFetching, data: canDeleteCheck }] = useLazyCheckCanDeleteFeatureSchemaQuery();

	if (isUninitialized === true) {
		trigger(schemaId);
	}

	const [deleteSchema, { isLoading: isDeleteSchemaLoading, isSuccess: isDeleteSchemaSuccessful, error: deleteError }] =
		useDeleteSchemaMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isDeleteSchemaSuccessful === true) {
			navigate('/SchemaManager');
		}
	}, [isDeleteSchemaSuccessful, navigate]);

	const onDelete = () => deleteSchema(schemaId);

	const onClose = () => navigate(-1);

	// Avoids a flash of the previous state showing while the refetching is happening
	if (isFetching === true) {
		return null;
	}

	if (canDeleteCheck === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Delete Schema
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					{deleteError !== undefined && (
						<Alert severity="error" sx={{ mb: 3 }}>
							<AlertTitle>Oh dear</AlertTitle>
							Something went wrong when we tried to delete this schema. It loooks like it may still be in use somehow.
						</Alert>
					)}

					{canDeleteCheck.deletable === true && (
						<React.Fragment>
							<Alert severity="info">
								<AlertTitle>Schema not in use</AlertTitle>
								This schema is not used by any features, so you&apos;re safe to delete it.
							</Alert>

							<FormControl sx={{ mt: 3 }} component="fieldset" variant="outlined">
								<LoadingButton
									loading={isDeleteSchemaLoading}
									loadingPosition="start"
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon color="error" />}
									onClick={onDelete}
									sx={{ maxWidth: 350 }}
								>
									{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
									<span>Delete</span>
								</LoadingButton>
							</FormControl>
						</React.Fragment>
					)}

					{canDeleteCheck.deletable === false && (
						<React.Fragment>
							<Alert severity="warning">
								<AlertTitle>Schema in use</AlertTitle>
								To delete this schema, please remove it from the features on these maps first.
							</Alert>

							<List dense>
								{canDeleteCheck.count_by_map.map(({ map_id, count }) => {
									const map = maps.find((m) => m.id === map_id);
									return (
										<ListItem key={map_id}>
											<ListItemText primary={map?.name || 'Unknown map'} secondary={`Used by ${count} feature(s)`} />
										</ListItem>
									);
								})}
							</List>
						</React.Fragment>
					)}
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SchemaDeleteManagerEntrypoint;
