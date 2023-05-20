import { createSelector } from '@reduxjs/toolkit';
import {
	FeatureSchemaFieldDefinitionCollection,
	featureSchemasAdapter,
	featureSchemasApi,
	initialFeatureSchemasState,
} from '../../app/services/schemas';

import { RootState } from '../../app/store';
import { selectMapById } from '../maps/mapsSlice';

export const selectFeatureSchemasResult = featureSchemasApi.endpoints.getFeatureSchemas.select();

const selectFeatureSchemasData = createSelector(
	selectFeatureSchemasResult,
	(featureSchemasResult) => featureSchemasResult.data
);

export const { selectAll: selectAllFeatureSchemas, selectById: selectFeatureSchemaById } =
	featureSchemasAdapter.getSelectors(
		(state: RootState) => selectFeatureSchemasData(state) ?? initialFeatureSchemasState
	);

export const getSchemasAvailableForMap = createSelector(selectAllFeatureSchemas, selectMapById, (schemas, map) =>
	schemas.filter((s) => map?.available_schema_ids.includes(s.id) === true)
);

export const getNextSchemaFieldId = (schemaDefinition: FeatureSchemaFieldDefinitionCollection[] | undefined) => {
	if (schemaDefinition === undefined || schemaDefinition.length === 0) {
		return 1;
	}

	return Math.max(...schemaDefinition.map((field) => field.id)) + 1;
};

export const getFieldFromSchemaById = (fieldId: number, schemaDefinition: FeatureSchemaFieldDefinitionCollection[]) =>
	schemaDefinition.find((field) => field.id === fieldId);
