import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import {
  FeatureDataItem,
  FeatureDataItemBooleanField,
} from "../../../app/services/features";
import {
  FeatureSchemaFieldDefinitionBooleanField,
  FeatureSchemaFieldDefinitionSymbologyBoolean,
  FeatureSchemaFieldType,
} from "../../../app/services/schemas";

interface Props {
  schemaField:
    | FeatureSchemaFieldDefinitionBooleanField
    | FeatureSchemaFieldDefinitionSymbologyBoolean;
  dataItem: FeatureDataItem | undefined;
  onFieldChange: (featureDataItem: FeatureDataItem) => void;
}

function SchemaDataEntryBooleanyTypeFields(props: Props) {
  console.log("### SchemaDataEntryBooleanyTypeFields ###");

  const { schemaField, dataItem, onFieldChange } = props;

  const onCheckboxFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange({
      schema_field_id: schemaField.id,
      value: e.target.checked,
    } as FeatureDataItemBooleanField);
  };

  if (
    !(
      schemaField.type === FeatureSchemaFieldType.BooleanField ||
      schemaField.type === FeatureSchemaFieldType.SymbologyFieldBoolean
    )
  ) {
    return null;
  }

  return (
    <FormControlLabel
      control={
        <Checkbox
          defaultChecked={
            dataItem !== undefined
              ? (dataItem.value as boolean)
              : schemaField.default_value
          }
          onChange={onCheckboxFieldChange}
        />
      }
      label={schemaField.name}
      sx={{ mt: -1, mb: 2 }}
    />
  );
}

export default SchemaDataEntryBooleanyTypeFields;
