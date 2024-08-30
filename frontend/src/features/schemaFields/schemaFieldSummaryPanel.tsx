import LinkIcon from '@mui/icons-material/Link';
import { Alert, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { FeatureDataItem, MapaFeature, NewMapaFeature } from '../../app/services/features';
import { FeatureSchemaFieldDefinitionCollection, FeatureSchemaFieldType } from '../../app/services/schemas';
import { isClipboardApiSupported } from '../../app/utils';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';

const getDataItemForDisplay = (
	schemaFieldDefinition: FeatureSchemaFieldDefinitionCollection,
	dataItem: FeatureDataItem,
) => {
	if (schemaFieldDefinition.type === FeatureSchemaFieldType.TextField) {
		return dataItem.value !== '' ? (dataItem.value as string) : <em>No text entered</em>;
	} else if (schemaFieldDefinition.type === FeatureSchemaFieldType.NumberField) {
		return dataItem.value as number;
	} else if (
		schemaFieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
		schemaFieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean
	) {
		return dataItem.value === true ? 'Checked' : 'Unchecked';
	} else if (schemaFieldDefinition.type === FeatureSchemaFieldType.DateField) {
		return typeof dataItem.value === 'string' && dataItem.value !== '' ? (
			dayjs(dataItem.value).format('ddd, MMM D YYYY')
		) : (
			<em>No date entered</em>
		);
	} else if (schemaFieldDefinition.type === FeatureSchemaFieldType.URLField) {
		return dataItem.value !== '' && Array.isArray(dataItem.value) ? (
			<List dense disablePadding sx={{ '& a': { color: 'rgba(0, 0, 0, 0.87)', textDecoration: 'none' } }}>
				{dataItem.value.map((i, idx) => (
					<ListItem key={idx} dense disablePadding disableGutters>
						<ListItemIcon sx={{ minWidth: 24 + 8 }}>
							<LinkIcon />
						</ListItemIcon>
						<ListItemButton dense disableGutters>
							<ListItemText
								primary={
									<Link key={idx} to={i.url} target="_blank">
										{i.name}
									</Link>
								}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		) : (
			<em>No links entered</em>
		);
	} else {
		return 'Unknown value-to-string mapping';
	}
};

interface Props {
	schemaId: number;
	feature: MapaFeature | NewMapaFeature;
}

function SchemaFieldSummaryPanel(props: Props) {
	const { schemaId, feature } = props;

	const schema = useAppSelector((state) => selectFeatureSchemaById(state, schemaId));

	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

	const handleSnackbarClose = () => setIsSnackbarOpen(false);

	const onClickField = (dataItem: FeatureDataItem) => async () => {
		if (
			isClipboardApiSupported() === true &&
			(typeof dataItem.value === 'string' || typeof dataItem.value === 'number')
		) {
			try {
				await navigator.clipboard.writeText(`${dataItem.value}`);
				setIsSnackbarOpen(true);
			} catch {
				/* empty */
			}
		}
	};

	if (schema === undefined || schema.definition.length === 0) {
		return null;
	}

	return (
		<React.Fragment>
			<List dense disablePadding>
				{schema.definition.map((schemaFieldDefinition) => {
					const dataItem = feature.data.find(
						(featureDataItem) => featureDataItem.schema_field_id === schemaFieldDefinition.id,
					);

					return dataItem !== undefined ? (
						isClipboardApiSupported() === true &&
						(typeof dataItem.value === 'string' || typeof dataItem.value === 'number') ? (
							<ListItem key={schemaFieldDefinition.id} sx={{ cursor: 'pointer' }}>
								<ListItemButton onClick={onClickField(dataItem)} disableGutters>
									<ListItemText
										primary={getDataItemForDisplay(schemaFieldDefinition, dataItem)}
										secondary={schemaFieldDefinition.name}
									/>
								</ListItemButton>
							</ListItem>
						) : (
							<ListItem key={schemaFieldDefinition.id}>
								<ListItemText
									primary={getDataItemForDisplay(schemaFieldDefinition, dataItem)}
									secondary={schemaFieldDefinition.name}
								/>
							</ListItem>
						)
					) : undefined;
				})}
			</List>

			<Snackbar open={isSnackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
				<Alert severity="success" sx={{ width: '100%' }}>
					Field copied
				</Alert>
			</Snackbar>
		</React.Fragment>
	);
}

export default SchemaFieldSummaryPanel;
