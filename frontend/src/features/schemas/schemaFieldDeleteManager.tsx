import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import React from 'react';
import { useAppSelector } from '../../app/hooks/store';
import { useLazyCheckCanDeleteFieldQuery } from '../../app/services/schemas';
import { selectAllMaps } from '../maps/mapsSlice';

interface Props {
	schemaId: number;
	fieldId: number;
	onYes: (fieldId: number) => void;
	onNo: () => void;
}

function SchemaFieldDeleteManager(props: Props) {
	const { schemaId, fieldId, onYes, onNo } = props;

	const maps = useAppSelector((state) => selectAllMaps(state));

	const [trigger, { isUninitialized, isFetching, data: canDeleteCheck }] = useLazyCheckCanDeleteFieldQuery();

	if (isUninitialized === true) {
		trigger({
			schemaId,
			fieldId,
		});
	}

	// Avoids a flash of the previous state showing while the refetching is happening
	if (isFetching === true) {
		return null;
	}

	const onDelete = (fieldId: number) => () => onYes(fieldId);

	return (
		<React.Fragment>
			{canDeleteCheck?.deletable === true && (
				<Dialog open={true} onClose={onNo} fullWidth>
					<DialogTitle>Delete field?</DialogTitle>
					<DialogActions>
						<Button onClick={onNo}>No</Button>
						<Button onClick={onDelete(fieldId)}>Yes</Button>
					</DialogActions>
				</Dialog>
			)}

			{canDeleteCheck?.deletable === false && (
				<Dialog open={true} onClose={onNo}>
					<DialogTitle>Field in use</DialogTitle>
					<DialogContent>
						To delete this field, please remove it from the features on these maps first.
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
					</DialogContent>
					<DialogActions>
						<Button onClick={onNo}>OK</Button>
					</DialogActions>
				</Dialog>
			)}
		</React.Fragment>
	);
}

export default SchemaFieldDeleteManager;
