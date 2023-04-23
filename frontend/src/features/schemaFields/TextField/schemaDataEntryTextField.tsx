import { TextField } from "@mui/material";
import React from "react";
import {
  FeatureDataItem,
  FeatureDataItemTextField,
} from "../../../app/services/features";
import {
  FeatureSchemaFieldDefinitionTextField,
  FeatureSchemaFieldType,
} from "../../../app/services/schemas";

interface Props {
  schemaField: FeatureSchemaFieldDefinitionTextField;
  dataItem: FeatureDataItem | undefined;
  onFieldChange: (featureDataItem: FeatureDataItem) => void;
  onFieldRemove: (schemaFieldId: number) => void;
}

function SchemaDataEntryTextField(props: Props) {
  console.log("### SchemaDataEntryTextField ###");

  const { schemaField, dataItem, onFieldChange, onFieldRemove } = props;

  const onTextFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.target.value !== "") {
      onFieldChange({
        schema_field_id: schemaField.id,
        value: e.target.value,
      } as FeatureDataItemTextField);
    } else {
      onFieldRemove(schemaField.id);
    }
  };

  if (schemaField.type !== FeatureSchemaFieldType.TextField) {
    return null;
  }

  return (
    <TextField
      onChange={onTextFieldChange}
      defaultValue={
        dataItem !== undefined ? dataItem.value : schemaField.default_value
      }
      label={schemaField.name}
      helperText={
        schemaField.default_value !== ""
          ? `Default value: ${schemaField.default_value}`
          : undefined
      }
      // Normal margins, but we don't need top margins because every element above these provides their own bottom margins
      margin="normal"
      sx={{ mt: 0 }}
    />
  );
}

export default SchemaDataEntryTextField;
