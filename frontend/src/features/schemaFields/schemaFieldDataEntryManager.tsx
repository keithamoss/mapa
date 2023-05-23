import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormGroup, FormHelperText, FormLabel } from '@mui/material';
import React from 'react';
import { useForm, UseFormHandleSubmit } from 'react-hook-form';
import {
	getDefaultValuesForSchemaFieldForm,
	getYupValidationSchemaForSchemaFieldForm,
} from '../../app/forms/schemaFieldsForms';
import { useAppSelector } from '../../app/hooks/store';
import { Feature } from '../../app/services/features';
import { FeatureSchema, FeatureSchemaFieldType } from '../../app/services/schemas';
import NotFound from '../../NotFound';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';
import SchemaDataEntryBooleanyTypeFields from './BooleanyTypeFields/schemaDataEntryBooleanyTypeFields';
import SchemaDataEntryNumberField from './NumberField/schemaDataEntryNumberField';
import SchemaDataEntryTextField from './TextField/schemaDataEntryTextField';

interface PropsEntrypoint {
	schemaId: number;
	feature: Feature;
	handleSubmitRef: React.MutableRefObject<UseFormHandleSubmit<SchemaFormFieldsFormValues> | undefined>;
	touchedFieldsRef: React.MutableRefObject<
		| Partial<
				Readonly<{
					[x: string]: boolean;
				}>
		  >
		| undefined
	>;
}

function SchemaFieldDataEntryManagerEntrypoint(props: PropsEntrypoint) {
	const { schemaId, ...rest } = props;

	const schema = useAppSelector((state) => selectFeatureSchemaById(state, schemaId));

	if (schema === undefined) {
		return <NotFound />;
	}

	if (schema.definition.length === 0) {
		// Reset our ref in case we're switching from a schema with fields to one without
		props.handleSubmitRef.current = undefined;
		props.touchedFieldsRef.current = undefined;
		return null;
	}

	return <SchemaFieldDataEntryManager schema={schema} {...rest} />;
}

export interface SchemaFormFieldsFormValues {
	[key: string]: string | number | boolean;
}

interface Props {
	schema: FeatureSchema;
	feature: Feature;
	handleSubmitRef: React.MutableRefObject<UseFormHandleSubmit<SchemaFormFieldsFormValues> | undefined>;
	touchedFieldsRef: React.MutableRefObject<
		| Partial<
				Readonly<{
					[x: string]: boolean;
				}>
		  >
		| undefined
	>;
}

function SchemaFieldDataEntryManager(props: Props) {
	const { schema, feature, handleSubmitRef, touchedFieldsRef } = props;

	const {
		handleSubmit,
		control,
		formState: { errors, touchedFields },
	} = useForm<SchemaFormFieldsFormValues>({
		resolver: yupResolver(getYupValidationSchemaForSchemaFieldForm(schema)),
		defaultValues: getDefaultValuesForSchemaFieldForm(schema, feature),
	});

	handleSubmitRef.current = handleSubmit;
	touchedFieldsRef.current = touchedFields;

	return (
		<FormControl fullWidth={true} component="fieldset" variant="outlined" sx={{ mb: 3 }}>
			<FormLabel component="legend" sx={{ mb: 2 }}>
				Your Fields
			</FormLabel>

			<FormGroup>
				{schema.definition.map((fieldDefinition, index) => {
					const featureDataItemForSchemaField = feature.data.find(
						(featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id,
					);

					let field: JSX.Element | null;
					switch (fieldDefinition.type) {
						case FeatureSchemaFieldType.TextField:
							field = (
								<SchemaDataEntryTextField key={fieldDefinition.id} control={control} schemaField={fieldDefinition} />
							);
							break;
						case FeatureSchemaFieldType.NumberField:
							field = (
								<SchemaDataEntryNumberField key={fieldDefinition.id} control={control} schemaField={fieldDefinition} />
							);
							break;
						case FeatureSchemaFieldType.BooleanField:
						case FeatureSchemaFieldType.SymbologyFieldBoolean:
							field = (
								<SchemaDataEntryBooleanyTypeFields
									key={fieldDefinition.id}
									control={control}
									schemaField={fieldDefinition}
									dataItem={featureDataItemForSchemaField}
								/>
							);
							break;
					}

					return (
						<FormControl
							fullWidth={true}
							sx={{
								mt: 0,
								mb:
									fieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
									fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean ||
									index == schema.definition.length - 1
										? 0
										: 3,
							}}
							key={fieldDefinition.id}
						>
							<FormGroup>{field}</FormGroup>
							{errors[`schema_field_${fieldDefinition.id}`] !== undefined && (
								<FormHelperText error>{errors[`schema_field_${fieldDefinition.id}`]?.message}</FormHelperText>
							)}
						</FormControl>
					);
				})}
			</FormGroup>
		</FormControl>
	);
}

export default SchemaFieldDataEntryManagerEntrypoint;
