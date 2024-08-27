import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import dayjs from 'dayjs';
import { useAppSelector } from '../../app/hooks/store';
import { FeatureDataItem, MapaFeature, NewMapaFeature } from '../../app/services/features';
import { FeatureSchemaFieldDefinitionCollection, FeatureSchemaFieldType } from '../../app/services/schemas';
import { isClipboardApiSupported } from '../../app/utils';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';

const getDataItemAsString = (
	schemaFieldDefinition: FeatureSchemaFieldDefinitionCollection,
	dataItem: FeatureDataItem,
) => {
	if (schemaFieldDefinition.type === FeatureSchemaFieldType.TextField) {
		return dataItem.value !== '' ? dataItem.value : <em>No text entered</em>;
	} else if (schemaFieldDefinition.type === FeatureSchemaFieldType.NumberField) {
		return dataItem.value;
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

	const onClickField = (dataItem: FeatureDataItem | undefined) => async () => {
		if (isClipboardApiSupported() === true && dataItem !== undefined) {
			try {
				await navigator.clipboard.writeText(`${dataItem.value}`);
			} catch {
				/* empty */
			}
		}
	};

	if (schema === undefined || schema.definition.length === 0) {
		return null;
	}

	return (
		<List dense disablePadding>
			{schema.definition.map((schemaFieldDefinition) => {
				const dataItem = feature.data.find(
					(featureDataItem) => featureDataItem.schema_field_id === schemaFieldDefinition.id,
				);

				return dataItem !== undefined ? (
					<ListItem key={schemaFieldDefinition.id} sx={{ cursor: 'pointer' }}>
						<ListItemButton onClick={onClickField(dataItem)}>
							<ListItemText
								primary={getDataItemAsString(schemaFieldDefinition, dataItem)}
								secondary={schemaFieldDefinition.name}
							/>
						</ListItemButton>
					</ListItem>
				) : undefined;
			})}
		</List>
	);
}

export default SchemaFieldSummaryPanel;
