import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { isEmpty } from "lodash-es";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { stopPropagate } from "../../app/forms/formUtils";
import { symbologyGroupFormValidationSchemaIDOnly } from "../../app/forms/symbologyGroupForm";
import { FeatureSchemaSymbologyGroup } from "../../app/services/schemas";
import { DialogWithTransition } from "../../app/ui/dialog";

interface FormState {
  id: string;
}

interface Props {
  groups: FeatureSchemaSymbologyGroup[];
  onDone: (groupId: number) => void;
  onCancel: () => void;
}

function SchemaSymbologyGroupChooserForRerranging(props: Props) {
  console.log("### SchemaSymbologyGroupChooserForRerranging ###");

  const { groups, onDone, onCancel } = props;

  const {
    handleSubmit,
    control,
    // formState: { errors },
  } = useForm<FormState>({
    resolver: yupResolver(symbologyGroupFormValidationSchemaIDOnly),
    defaultValues: {
      id: "",
    },
  });

  const onDoneWithForm: SubmitHandler<FormState> = (data) => {
    if (isEmpty(data) === false) {
      // NOTE: The id is technically already a number here, but because of
      // react-hook-form's inability to take undefined/null for controlled inputs
      // it needs to think that it's a string.
      // This parsing doesn't actually do anything but make TypeScript happy.
      onDone(parseInt(`${data.id}`));
    }
  };

  const onClickMove = () => {
    handleSubmit(onDoneWithForm)();
  };

  return (
    <DialogWithTransition
      onClose={onCancel}
      dialogProps={{ fullScreen: false, fullWidth: true }}
    >
      <DialogContent>
        <form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
          <FormControl
            fullWidth={true}
            component="fieldset"
            variant="outlined"
            sx={{ mt: 1 }}
          >
            <FormGroup>
              <InputLabel>Group</InputLabel>

              <Controller
                name="id"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Group">
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormGroup>
          </FormControl>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onClickMove}>Move</Button>
      </DialogActions>
    </DialogWithTransition>
  );
}

export default SchemaSymbologyGroupChooserForRerranging;
