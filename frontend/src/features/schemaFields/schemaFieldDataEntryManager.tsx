import { FormControl, FormGroup, FormLabel } from "@mui/material";
import { useAppSelector } from "../../app/hooks/store";
import { Feature, FeatureDataItem } from "../../app/services/features";
import { FeatureSchemaFieldType } from "../../app/services/schemas";
import { selectFeatureSchemaById } from "../schemas/schemasSlice";
import SchemaDataEntryBooleanyTypeFields from "./BooleanyTypeFields/schemaDataEntryBooleanyTypeFields";
import SchemaDataEntryNumberField from "./NumberField/schemaDataEntryNumberField";
import SchemaDataEntryTextField from "./TextField/schemaDataEntryTextField";

interface Props {
  schemaId: number;
  feature: Feature;
  onFieldChange: (featureDataItem: FeatureDataItem) => void;
  onFieldRemove: (schemaFieldId: number) => void;
}

function SchemaFieldDataEntryManager(props: Props) {
  console.log("### SchemaFieldDataEntryManager ###");

  const { schemaId, feature, onFieldChange, onFieldRemove } = props;

  const schema = useAppSelector((state) =>
    selectFeatureSchemaById(state, schemaId)
  );

  if (schema === undefined || schema.definition.length === 0) {
    return null;
  }

  return (
    <FormControl fullWidth={true} component="fieldset" variant="outlined">
      <FormLabel component="legend" sx={{ mb: 2 }}>
        Your Fields
      </FormLabel>

      <FormGroup>
        {schema.definition.map((fieldDefinition, idx) => {
          const featureDataItemForSchemaField = feature.data.find(
            (featureDataItem) =>
              featureDataItem.schema_field_id === fieldDefinition.id
          );

          switch (fieldDefinition.type) {
            case FeatureSchemaFieldType.TextField:
              return (
                <SchemaDataEntryTextField
                  key={fieldDefinition.id}
                  schemaField={fieldDefinition}
                  dataItem={featureDataItemForSchemaField}
                  onFieldChange={onFieldChange}
                  onFieldRemove={onFieldRemove}
                />
              );
            case FeatureSchemaFieldType.NumberField:
              return (
                <SchemaDataEntryNumberField
                  key={fieldDefinition.id}
                  schemaField={fieldDefinition}
                  dataItem={featureDataItemForSchemaField}
                  onFieldChange={onFieldChange}
                  onFieldRemove={onFieldRemove}
                />
              );
            case FeatureSchemaFieldType.BooleanField:
            case FeatureSchemaFieldType.SymbologyFieldBoolean:
              return (
                <SchemaDataEntryBooleanyTypeFields
                  key={fieldDefinition.id}
                  schemaField={fieldDefinition}
                  dataItem={featureDataItemForSchemaField}
                  onFieldChange={onFieldChange}
                />
              );
            default:
              return null;
          }
        })}
      </FormGroup>
    </FormControl>
  );
}

export default SchemaFieldDataEntryManager;
