import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { usePatchMapMutation } from '../../app/services/maps';
import { NewFeatureSchema, useAddFeatureSchemaMutation } from '../../app/services/schemas';
import { selectActiveMapId } from '../app/appSlice';
import { selectMapById } from '../maps/mapsSlice';
import SchemaForm from './schemaForm';

function SchemaCreator() {
	const navigate = useNavigate();

	const mapId = useAppSelector(selectActiveMapId);
	const map = useAppSelector((state) => (mapId !== undefined ? selectMapById(state, mapId) : undefined));

	const [addSchema, { isSuccess: isAddingSchemaSuccessful }] = useAddFeatureSchemaMutation();

	useEffect(() => {
		if (isAddingSchemaSuccessful === true && mapId === undefined) {
			navigate(-1);
		}
	}, [isAddingSchemaSuccessful, mapId, navigate]);

	const [patchMap, { isSuccess: isPatchingMapSuccessful }] = usePatchMapMutation();

	useEffect(() => {
		if (isPatchingMapSuccessful === true && mapId !== undefined) {
			navigate(-1);
		}
	}, [isPatchingMapSuccessful, mapId, navigate]);

	const onDoneAdding = useCallback(
		async (schema: NewFeatureSchema) => {
			const newSchema = await addSchema(schema).unwrap();

			if (mapId !== undefined && map !== undefined) {
				patchMap({
					id: mapId,
					available_schema_ids: [...map.available_schema_ids, newSchema.id],
				});
			}
		},
		[addSchema, map, mapId, patchMap]
	);

	return <SchemaForm onDoneAdding={onDoneAdding} />;
}

export default SchemaCreator;
