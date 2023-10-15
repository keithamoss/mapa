import { List, ListItem, ListItemText } from '@mui/material';
import dayjs from 'dayjs';
import { useAppSelector } from '../../app/hooks/store';
import { Feature, FeatureDataItem } from '../../app/services/features';
import { FeatureSchemaFieldDefinitionCollection, FeatureSchemaFieldType } from '../../app/services/schemas';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';

const getDataItemAsString = (
	schemaFieldDefinition: FeatureSchemaFieldDefinitionCollection,
	dataItem: FeatureDataItem,
) => {
	if (
		schemaFieldDefinition.type === FeatureSchemaFieldType.TextField ||
		schemaFieldDefinition.type === FeatureSchemaFieldType.NumberField
	) {
		return dataItem.value;
	} else if (
		schemaFieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
		schemaFieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean
	) {
		return dataItem.value === true ? 'On' : 'Off';
	} else if (schemaFieldDefinition.type === FeatureSchemaFieldType.DateField) {
		return typeof dataItem.value === 'string' ? dayjs(dataItem.value).format('ddd, MMM D YYYY') : '';
	} else {
		return 'Unknown value-to-string mapping';
	}
};

interface Props {
	schemaId: number;
	feature: Feature;
}

function SchemaFieldSummaryPanel(props: Props) {
	const { schemaId, feature } = props;

	const schema = useAppSelector((state) => selectFeatureSchemaById(state, schemaId));

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
					<ListItem key={schemaFieldDefinition.id}>
						<ListItemText
							primary={getDataItemAsString(schemaFieldDefinition, dataItem)}
							secondary={schemaFieldDefinition.name}
						/>
					</ListItem>
				) : undefined;
			})}
		</List>
	);
}

export default SchemaFieldSummaryPanel;
