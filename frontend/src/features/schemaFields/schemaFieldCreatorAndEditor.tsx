import React from "react";
import {
  FeatureSchemaFieldDefinitionBooleanField,
  FeatureSchemaFieldDefinitionCollection,
  FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
  FeatureSchemaFieldDefinitionNumberField,
  FeatureSchemaFieldDefinitionSymbologyBoolean,
  FeatureSchemaFieldDefinitionTextField,
  FeatureSchemaFieldType,
  NewFeatureSchemaFieldDefinitionCollection,
} from "../../app/services/schemas";
import SchemaFieldFormForBooleanField from "./BooleanField/schemaFieldFormForBooleanField";
import SchemaFieldFormForNumberField from "./NumberField/schemaFieldFormForNumberField";
import SchemaFieldFormForSymbologyBoolean from "./SymbologyBooleanField/schemaFieldFormForSymbologyBoolean";
import SchemaFieldFormForTextField from "./TextField/schemaFieldFormForTextField";

interface Props {
  fieldTypeToAdd?: FeatureSchemaFieldType;
  fieldToEdit?: FeatureSchemaFieldDefinitionCollection;
  onDoneAdding?: (field: NewFeatureSchemaFieldDefinitionCollection) => void;
  onDoneEditing?: (field: FeatureSchemaFieldDefinitionCollection) => void;
  onCancel: () => void;
}

function SchemaFieldCreatorAndEditor(props: Props) {
  console.log("### SchemaFieldCreatorAndEditor ###");

  const { fieldTypeToAdd, fieldToEdit, onDoneAdding, onDoneEditing, onCancel } =
    props;

  const onDone = (
    fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection
  ) => {
    if (onDoneAdding !== undefined) {
      const fieldData = {
        type: fieldTypeToAdd,
        ...fieldFormProps,
      };

      onDoneAdding(fieldData as NewFeatureSchemaFieldDefinitionCollection);
    } else if (onDoneEditing !== undefined && fieldToEdit !== undefined) {
      const fieldData = {
        ...fieldToEdit,
        ...fieldFormProps,
      };

      onDoneEditing(fieldData as FeatureSchemaFieldDefinitionCollection);
    }
  };

  return (
    <React.Fragment>
      {(fieldTypeToAdd === FeatureSchemaFieldType.TextField ||
        fieldToEdit?.type === FeatureSchemaFieldType.TextField) && (
        <SchemaFieldFormForTextField
          field={fieldToEdit as FeatureSchemaFieldDefinitionTextField}
          onDone={onDone}
          onCancel={onCancel}
        />
      )}

      {(fieldTypeToAdd === FeatureSchemaFieldType.NumberField ||
        fieldToEdit?.type === FeatureSchemaFieldType.NumberField) && (
        <SchemaFieldFormForNumberField
          field={fieldToEdit as FeatureSchemaFieldDefinitionNumberField}
          onDone={onDone}
          onCancel={onCancel}
        />
      )}

      {(fieldTypeToAdd === FeatureSchemaFieldType.BooleanField ||
        fieldToEdit?.type === FeatureSchemaFieldType.BooleanField) && (
        <SchemaFieldFormForBooleanField
          field={fieldToEdit as FeatureSchemaFieldDefinitionBooleanField}
          onDone={onDone}
          onCancel={onCancel}
        />
      )}

      {(fieldTypeToAdd === FeatureSchemaFieldType.SymbologyFieldBoolean ||
        fieldToEdit?.type === FeatureSchemaFieldType.SymbologyFieldBoolean) && (
        <SchemaFieldFormForSymbologyBoolean
          field={fieldToEdit as FeatureSchemaFieldDefinitionSymbologyBoolean}
          onDone={onDone}
          onCancel={onCancel}
        />
      )}
    </React.Fragment>
  );
}

export default SchemaFieldCreatorAndEditor;
