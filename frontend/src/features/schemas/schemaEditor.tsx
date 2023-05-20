import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { FeatureSchema, useUpdateFeatureSchemaMutation } from '../../app/services/schemas';
import SchemaForm from './schemaForm';
import { selectFeatureSchemaById } from './schemasSlice';

function SchemaEditorEntrypoint() {
	const params = useParams();
	const schemaId = getIntegerParamOrUndefined(params, 'schemaId');

	if (schemaId === undefined) {
		return <NotFound />;
	}

	return <SchemaEditor schemaId={schemaId} />;
}

interface LocationState {
	source?: string;
}

interface Props {
	schemaId: number;
	onDoneEditingSchema?: () => void;
	onCancelEditing?: () => void;
}

export function SchemaEditor(props: Props) {
	const { schemaId, onDoneEditingSchema, onCancelEditing } = props;

	const navigate = useNavigate();

	const location = useLocation();
	const source = (location.state as LocationState)?.source;

	const schema = useAppSelector((state) => {
		if (schemaId !== undefined) {
			return selectFeatureSchemaById(state, schemaId);
		}
	});

	const [
		updateSchema,
		{
			isSuccess: isUpdatingSchemaSuccessful,
			// isLoading: isUpdatingSchemaLoading,
		},
	] = useUpdateFeatureSchemaMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isUpdatingSchemaSuccessful === true) {
			if (onDoneEditingSchema === undefined) {
				navigate(source || '/SchemaManager/');
			} else {
				onDoneEditingSchema();
			}
		}
	}, [isUpdatingSchemaSuccessful, navigate, onDoneEditingSchema, source]);

	// if (isUpdatingSchemaSuccessful === true) {
	//   navigate(source || "/SchemaManager/");
	// }

	const onDoneEditing = useCallback(
		(schema: FeatureSchema) => {
			updateSchema(schema);
		},
		[updateSchema]
	);

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	if (schema === undefined) {
		return null;
	}

	return <SchemaForm schema={schema} onDoneEditing={onDoneEditing} onCancel={onCancelEditing} />;
}

export default SchemaEditorEntrypoint;
