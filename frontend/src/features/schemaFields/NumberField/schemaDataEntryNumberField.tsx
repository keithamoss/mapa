import { TextField } from "@mui/material";
import React from "react";
import {
  FeatureDataItem,
  FeatureDataItemNumberField,
} from "../../../app/services/features";
import {
  FeatureSchemaFieldDefinitionNumberField,
  FeatureSchemaFieldType,
} from "../../../app/services/schemas";

interface Props {
  schemaField: FeatureSchemaFieldDefinitionNumberField;
  dataItem: FeatureDataItem | undefined;
  onFieldChange: (featureDataItem: FeatureDataItem) => void;
  onFieldRemove: (schemaFieldId: number) => void;
}

function SchemaDataEntryNumberField(props: Props) {
  console.log("### SchemaDataEntryNumberField ###");

  const { schemaField, dataItem, onFieldChange, onFieldRemove } = props;

  const onTextFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    console.log("e.target.value", e.target.value);
    if (e.target.value !== "") {
      onFieldChange({
        schema_field_id: schemaField.id,
        value: parseInt(e.target.value),
      } as FeatureDataItemNumberField);
    } else {
      onFieldRemove(schemaField.id);
    }
  };

  if (schemaField.type !== FeatureSchemaFieldType.NumberField) {
    return null;
  }

  return (
    <TextField
      type="number"
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
      onChange={onTextFieldChange}
      defaultValue={
        dataItem !== undefined ? dataItem.value : schemaField.default_value
      }
      label={schemaField.name}
      helperText={
        schemaField.default_value !== undefined
          ? `Default value: ${schemaField.default_value}`
          : undefined
      }
      // Normal margins, but we don't need top margins because every element above these provides their own bottom margins
      margin="normal"
      sx={{ mt: 0, mb: 2 }}
    />
  );
}

export default SchemaDataEntryNumberField;
