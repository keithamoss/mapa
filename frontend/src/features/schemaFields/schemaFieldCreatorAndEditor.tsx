import React from 'react';
import {
	type FeatureSchemaFieldDefinitionBooleanField,
	type FeatureSchemaFieldDefinitionCollection,
	type FeatureSchemaFieldDefinitionDateField,
	type FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
	type FeatureSchemaFieldDefinitionNumberField,
	type FeatureSchemaFieldDefinitionSymbologyBooleanField,
	type FeatureSchemaFieldDefinitionTextField,
	type FeatureSchemaFieldDefinitionURLField,
	FeatureSchemaFieldType,
	type NewFeatureSchemaFieldDefinitionCollection,
} from '../../app/services/schemas';
import SchemaFieldFormForBooleanField from './BooleanField/schemaFieldFormForBooleanField';
import SchemaFieldFormForDateField from './DateField/schemaFieldFormForDateField';
import SchemaFieldFormForNumberField from './NumberField/schemaFieldFormForNumberField';
import SchemaFieldFormForSymbologyBoolean from './SymbologyBooleanField/schemaFieldFormForSymbologyBoolean';
import SchemaFieldFormForTextField from './TextField/schemaFieldFormForTextField';
import SchemaFieldFormForURLField from './URLField/schemaFieldFormForURLField';

interface Props {
	fieldTypeToAdd?: FeatureSchemaFieldType;
	fieldToEdit?: FeatureSchemaFieldDefinitionCollection;
	onDoneAdding?: (field: NewFeatureSchemaFieldDefinitionCollection) => void;
	onDoneEditing?: (field: FeatureSchemaFieldDefinitionCollection) => void;
	onCancel: () => void;
}

function SchemaFieldCreatorAndEditor(props: Props) {
	const { fieldTypeToAdd, fieldToEdit, onDoneAdding, onDoneEditing, onCancel } = props;

	const onDone = (fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection) => {
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
					field={fieldToEdit as FeatureSchemaFieldDefinitionSymbologyBooleanField}
					onDone={onDone}
					onCancel={onCancel}
				/>
			)}

			{(fieldTypeToAdd === FeatureSchemaFieldType.DateField ||
				fieldToEdit?.type === FeatureSchemaFieldType.DateField) && (
				<SchemaFieldFormForDateField
					field={fieldToEdit as FeatureSchemaFieldDefinitionDateField}
					onDone={onDone}
					onCancel={onCancel}
				/>
			)}

			{(fieldTypeToAdd === FeatureSchemaFieldType.URLField ||
				fieldToEdit?.type === FeatureSchemaFieldType.URLField) && (
				<SchemaFieldFormForURLField
					field={fieldToEdit as FeatureSchemaFieldDefinitionURLField}
					onDone={onDone}
					onCancel={onCancel}
				/>
			)}
		</React.Fragment>
	);
}

export default SchemaFieldCreatorAndEditor;
