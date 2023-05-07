import { yupResolver } from "@hookform/resolvers/yup";
import { isEmpty } from "lodash-es";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormHelperText,
  TextField,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { stopPropagate } from "../../../app/forms/formUtils";
import { schemaNumberFieldFormValidationSchema } from "../../../app/forms/schemaFieldsForms";
import {
  getNumberOrZeroForSchemasFieldsFormField,
  getStringOrEmptyStringForSchemasFieldsFormField,
} from "../../../app/forms/schemaForm";
import {
  FeatureSchemaFieldDefinitionFormModifiablePropsCollection,
  FeatureSchemaFieldDefinitionNumberField,
  FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps,
} from "../../../app/services/schemas";
import { DialogWithTransition } from "../../../app/ui/dialog";

interface Props {
  field: FeatureSchemaFieldDefinitionNumberField | undefined;
  onDone: (
    fieldFormProps: FeatureSchemaFieldDefinitionFormModifiablePropsCollection
  ) => void;
  onCancel: () => void;
}

function SchemaFieldFormForNumberField(props: Props) {
  console.log("### SchemaFieldFormForNumberField ###");

  const { field, onDone, onCancel } = props;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps>({
    resolver: yupResolver(schemaNumberFieldFormValidationSchema),
    defaultValues: {
      name: getStringOrEmptyStringForSchemasFieldsFormField(field, "name"),
      default_value: getNumberOrZeroForSchemasFieldsFormField(
        field,
        "default_value"
      ),
    },
  });

  const onDoneWithForm: SubmitHandler<
    FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps
  > = (data) => {
    if (isEmpty(data) === false) {
      onDone(data);
    }
  };

  const onClickSave = () => {
    handleSubmit(onDoneWithForm)();
  };

  return (
    <DialogWithTransition
      onClose={onCancel}
      dialogProps={{ fullScreen: false, fullWidth: true }}
    >
      <DialogTitle>Number Field</DialogTitle>
      <DialogContent>
        <form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
          <FormControl
            fullWidth={true}
            sx={{ mb: 3, mt: 1 }}
            component="fieldset"
            variant="outlined"
          >
            <FormGroup>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Field label" />
                )}
              />
            </FormGroup>

            {errors.name && (
              <FormHelperText error>{errors.name.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth={true} component="fieldset" variant="outlined">
            <FormGroup>
              <Controller
                name="default_value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    label="Default value"
                    helperText="Will be used if you don't enter anything when creating a feature"
                  />
                )}
              />
            </FormGroup>

            {errors.default_value && (
              <FormHelperText error>
                {errors.default_value.message}
              </FormHelperText>
            )}
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onClickSave}>Save</Button>
      </DialogActions>
    </DialogWithTransition>
  );
}

export default SchemaFieldFormForNumberField;
