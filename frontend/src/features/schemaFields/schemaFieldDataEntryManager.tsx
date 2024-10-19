import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormGroup, FormHelperText } from '@mui/material';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { useEffect } from 'react';
import { type UseFormHandleSubmit, useForm } from 'react-hook-form';
import NotFound from '../../NotFound';
import {
	getDefaultValuesForSchemaFieldForm,
	getYupValidationSchemaForSchemaFieldForm,
} from '../../app/forms/schemaFieldsForms';
import { useAppSelector } from '../../app/hooks/store';
import { usePrevious } from '../../app/hooks/usePrevious';
import type { FeatureDataItemURLFieldLinkItem, MapaFeature, NewMapaFeature } from '../../app/services/features';
import { type FeatureSchema, FeatureSchemaFieldType } from '../../app/services/schemas';
import FormSectionHeading from '../../app/ui/formSectionHeading';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';
import SchemaDataEntryBooleanyTypeFields from './BooleanyTypeFields/schemaDataEntryBooleanyTypeFields';
import SchemaDataEntryDateField from './DateField/schemaDataEntryDateField';
import SchemaDataEntryNumberField from './NumberField/schemaDataEntryNumberField';
import SchemaDataEntryTextField from './TextField/schemaDataEntryTextField';
import SchemaDataEntryURLField from './URLField/schemaDataEntryURLField';

interface PropsEntrypoint {
	schemaId: number;
	feature: MapaFeature | NewMapaFeature;
	handleSubmitRef: React.MutableRefObject<UseFormHandleSubmit<SchemaFormFieldsFormValues> | undefined>;
	touchedFieldsRef: React.MutableRefObject<Partial<Readonly<SchemaFieldDataEntryManagerTouchedFields>> | undefined>;
	isDirtyRef: React.MutableRefObject<boolean | undefined>;
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
		props.isDirtyRef.current = undefined;
		return null;
	}

	return <SchemaFieldDataEntryManager schema={schema} {...rest} />;
}

export interface SchemaFormFieldsFormValues {
	[key: string]: string | number | boolean | FeatureDataItemURLFieldLinkItem[];
}

export interface SchemaFieldDataEntryManagerTouchedFields {
	[x: string]: // For all other schema field types
		| boolean
		// For FeatureDataItemURLFieldLinkItem
		| {
				name?: boolean | undefined;
				url?: boolean | undefined;
				id?: boolean | undefined;
		  }[];
}

interface Props {
	schema: FeatureSchema;
	feature: MapaFeature | NewMapaFeature;
	handleSubmitRef: React.MutableRefObject<UseFormHandleSubmit<SchemaFormFieldsFormValues> | undefined>;
	touchedFieldsRef: React.MutableRefObject<Partial<Readonly<SchemaFieldDataEntryManagerTouchedFields>> | undefined>;
	isDirtyRef: React.MutableRefObject<boolean | undefined>;
}

function SchemaFieldDataEntryManager(props: Props) {
	const { schema, feature, handleSubmitRef, touchedFieldsRef, isDirtyRef } = props;

	const defaultValues = getDefaultValuesForSchemaFieldForm(schema, feature);
	const previousDefaultValues = usePrevious(defaultValues);

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		reset,
		formState: { errors, touchedFields, isDirty },
	} = useForm<SchemaFormFieldsFormValues>({
		resolver: yupResolver(getYupValidationSchemaForSchemaFieldForm(schema)),
		defaultValues,
	});

	handleSubmitRef.current = handleSubmit;
	touchedFieldsRef.current = touchedFields;
	isDirtyRef.current = isDirty;

	// Ensure we reset the form's state, and set new default values, when the schema changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// This is a good enough check to know if the schema has changed.
		if (isEqual(defaultValues, previousDefaultValues) === false) {
			reset(defaultValues);
		}
	}, [defaultValues]);

	return (
		<FormControl fullWidth={true} component="fieldset" variant="outlined" sx={{ mb: 3 }}>
			<FormSectionHeading marginBottom={2}>Your Fields</FormSectionHeading>

			<FormGroup>
				{schema.definition.map((fieldDefinition, index) => {
					const featureDataItemForSchemaField = feature.data.find(
						(featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id,
					);

					let field: JSX.Element | null;
					switch (fieldDefinition.type) {
						case FeatureSchemaFieldType.TextField:
							field = (
								<SchemaDataEntryTextField
									key={`${schema.id}_${fieldDefinition.id}`}
									control={control}
									schemaField={fieldDefinition}
									setValue={setValue}
								/>
							);
							break;
						case FeatureSchemaFieldType.NumberField:
							field = (
								<SchemaDataEntryNumberField
									key={`${schema.id}_${fieldDefinition.id}`}
									control={control}
									schemaField={fieldDefinition}
								/>
							);
							break;
						case FeatureSchemaFieldType.BooleanField:
						case FeatureSchemaFieldType.SymbologyFieldBoolean:
							field = (
								<SchemaDataEntryBooleanyTypeFields
									key={`${schema.id}_${fieldDefinition.id}`}
									control={control}
									schemaField={fieldDefinition}
									dataItem={featureDataItemForSchemaField}
								/>
							);
							break;
						case FeatureSchemaFieldType.DateField:
							field = (
								<SchemaDataEntryDateField
									key={`${schema.id}_${fieldDefinition.id}`}
									control={control}
									schemaField={fieldDefinition}
								/>
							);
							break;
						case FeatureSchemaFieldType.URLField:
							field = (
								<SchemaDataEntryURLField
									key={`${schema.id}_${fieldDefinition.id}`}
									schemaField={fieldDefinition}
									watch={watch}
									setValue={setValue}
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
									index === schema.definition.length - 1
										? 0
										: 3,
							}}
							key={fieldDefinition.id}
						>
							<FormGroup>{field}</FormGroup>
							{errors[`schema_field_${fieldDefinition.id}`] !== undefined && (
								<FormHelperText error>
									{fieldDefinition.type === FeatureSchemaFieldType.URLField
										? typeof errors[`schema_field_${fieldDefinition.id}`]?.message === 'string'
											? errors[`schema_field_${fieldDefinition.id}`]?.message
											: 'This field is invalid...somehow 🤷‍♂️'
										: errors[`schema_field_${fieldDefinition.id}`]?.message}
								</FormHelperText>
							)}
						</FormControl>
					);
				})}
			</FormGroup>
		</FormControl>
	);
}

export default SchemaFieldDataEntryManagerEntrypoint;
