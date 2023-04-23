import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  NewFeatureSchema,
  useAddFeatureSchemaMutation,
} from "../../app/services/schemas";
import SchemaForm from "./schemaForm";

interface Props {}

function SchemaCreator(props: Props) {
  console.log("### SchemaCreator ###");

  const navigate = useNavigate();

  const [
    addSchema,
    {
      isSuccess:
        isAddingSchemaSuccessful /*, isLoading: isAddingSchemaLoading*/,
    },
  ] = useAddFeatureSchemaMutation();

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isAddingSchemaSuccessful === true) {
      navigate(-1);
    }
  }, [isAddingSchemaSuccessful, navigate]);

  // if (isAddingSchemaSuccessful === true) {
  //   navigate(-1);
  // }

  const onDoneAdding = useCallback(
    (schema: NewFeatureSchema) => {
      addSchema(schema);
    },
    [addSchema]
  );

  return <SchemaForm onDoneAdding={onDoneAdding} />;
}

export default SchemaCreator;
