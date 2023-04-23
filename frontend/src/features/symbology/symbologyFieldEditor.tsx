import CloseIcon from "@mui/icons-material/Close";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

import { isEmpty, pickBy } from "lodash-es";
import { useCallback, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { stopPropagate } from "../../app/forms/formUtils";
import {
  getNumberOrDefaultForSymbologyField,
  getStringOrDefaultForSymbologyField,
  getStringOrEmptyStringForSymbologyField,
  symbolMaximumOpacity,
  symbolMaximumRotation,
  symbolMaximumSize,
  symbolMaximumStrokeWidth,
  symbolMinimumOpacity,
  symbolMinimumRotation,
  symbolMinimumSize,
  symbolMinimumStrokeWidth,
  symbologyFormValidationSchema,
} from "../../app/forms/symbologyForm";
import {
  FeatureSchemaSymbologyGroup,
  SymbologyProps,
} from "../../app/services/schemas";
import { getIconsMetadataByIconName } from "../ol_map/iconsMetadata";
import {
  defaultSymbolColour,
  defaultSymbolFillColourForSymbologyForm,
  defaultSymbolIcon,
  defaultSymbolOpacity,
  defaultSymbolRotation,
  defaultSymbolSize,
  defaultSymbolStrokeWidth,
  defaultSymbologyGroupId,
  getAppDefaultSymbologyConfig,
  getIconForSymbolForFormPreview,
} from "./symbologyHelpers";

import React from "react";
import { DialogWithTransition } from "../../app/ui/dialog";
import "./colourPicker.css";
import SliderFixed from "./sliderFixed";
import SymbologyIconAutocomplete from "./symbologyIconAutocomplete";

const getSymbologyDefaults = () => ({
  icon: defaultSymbolIcon,
  size: defaultSymbolSize,
  stroke_width: defaultSymbolStrokeWidth,
  rotation: defaultSymbolRotation,
  opacity: defaultSymbolOpacity,
  colour: defaultSymbolColour,
  fill: defaultSymbolFillColourForSymbologyForm,
});

const getDefaultValues = (symbol: SymbologyProps | null | undefined) => {
  const defaultValues = {
    name: getStringOrEmptyStringForSymbologyField(symbol, "name"),
    icon: getStringOrDefaultForSymbologyField(
      symbol,
      "icon",
      defaultSymbolIcon
    ),
    colour: getStringOrDefaultForSymbologyField(
      symbol,
      "colour",
      defaultSymbolColour
    ),
    fill: getStringOrDefaultForSymbologyField(
      symbol,
      "fill",
      defaultSymbolFillColourForSymbologyForm
    ),
    size: getNumberOrDefaultForSymbologyField(
      symbol,
      "size",
      defaultSymbolSize
    ),
    stroke_width: getNumberOrDefaultForSymbologyField(
      symbol,
      "stroke_width",
      defaultSymbolStrokeWidth
    ),
    opacity: getNumberOrDefaultForSymbologyField(
      symbol,
      "opacity",
      defaultSymbolOpacity
    ),
    rotation: getNumberOrDefaultForSymbologyField(
      symbol,
      "rotation",
      defaultSymbolRotation
    ),
  };

  return pickBy(defaultValues, (v) => v !== undefined);
};

const removeDefaultValuesFromForm = (
  data: SymbologyProps,
  nameFieldRequired: boolean,
  iconFieldRequired: boolean
) => {
  const defaults = getSymbologyDefaults() as SymbologyProps;

  Object.keys(data).forEach((propName) => {
    if (
      data[propName as keyof SymbologyProps] ===
      defaults[propName as keyof SymbologyProps]
    ) {
      delete data[propName as keyof SymbologyProps];
    }

    if (
      propName === "name" &&
      nameFieldRequired === false &&
      data[propName as keyof SymbologyProps] === ""
    ) {
      delete data[propName as keyof SymbologyProps];
    }

    if (
      propName === "icon" &&
      iconFieldRequired === false &&
      data[propName as keyof SymbologyProps] === ""
    ) {
      delete data[propName as keyof SymbologyProps];
    }
  });

  return data;
};

interface Props {
  symbol?: SymbologyProps | null;
  onDone: (symbolField: SymbologyProps, groupId: number) => void;
  onCancel: () => void;
  groups?: FeatureSchemaSymbologyGroup[];
  currentGroupId?: number;
  nameFieldRequired: boolean;
  iconFieldRequired: boolean;
}

function SymbologyFieldEditor(props: Props) {
  console.log("### SymbologyFieldEditor ###");

  const {
    symbol,
    onDone,
    onCancel,
    groups,
    currentGroupId,
    nameFieldRequired,
    iconFieldRequired,
  } = props;

  const [selectedGroupId, setSelectedGroupId] = useState<number>(
    currentGroupId || defaultSymbologyGroupId
  );

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SymbologyProps>({
    resolver: yupResolver(
      symbologyFormValidationSchema(nameFieldRequired, iconFieldRequired)
    ),
    defaultValues: getDefaultValues(symbol),
  });

  const { icon, colour, fill, size, stroke_width, rotation, opacity } = watch();

  const onChooseGroupId = (e: SelectChangeEvent<number>) => {
    const groupId = parseInt(`${e.target.value}`);

    if (Number.isNaN(groupId) === false) {
      setSelectedGroupId(groupId);
    }
  };

  const onChooseSymbol = (icon: string | null) => {
    onCloseIconChooserDialog();

    setValue("icon", icon !== null ? icon : defaultSymbolIcon);
  };

  const copyStrokeColourToFillColour = () => {
    setValue("fill", colour);
  };

  const onDoneWithForm: SubmitHandler<SymbologyProps> = (data) => {
    const dataWithDefaultsRemoved = removeDefaultValuesFromForm(
      data,
      nameFieldRequired,
      iconFieldRequired
    );

    if (isEmpty(dataWithDefaultsRemoved) === false) {
      onDone(dataWithDefaultsRemoved, selectedGroupId);
    } else {
      // Avoids SymbologyIconAutocomplete problems with undefined values
      onCancel();
    }
  };

  const onClickSave = () => {
    handleSubmit(onDoneWithForm)();
  };

  const textInput = useRef<HTMLInputElement>(null);

  // ######################
  // Symbol Chooser Dialog
  // ######################
  const [isIconChooserDialogOpen, setIsIconChooserDialogOpen] = useState(false);

  const onOpenIconChooserDialog = () => setIsIconChooserDialogOpen(true);

  const onCloseIconChooserDialog = () => setIsIconChooserDialogOpen(false);

  const autocompleteInputRef = useRef<HTMLElement>(null);

  const transitionEndEvent = useCallback(() => {
    if (
      autocompleteInputRef.current !== null &&
      document?.activeElement !== autocompleteInputRef.current
    ) {
      autocompleteInputRef.current.focus();
    }
  }, []);
  // ######################
  // Symbol Chooser Dialog (End)
  // ######################

  return (
    <React.Fragment>
      <DialogWithTransition
        dialogProps={{ open: isIconChooserDialogOpen }}
        transitionProps={{
          onEnter: (node: HTMLElement, isAppearing: boolean) => {
            if (isAppearing === true) {
              node.addEventListener("transitionend", transitionEndEvent, {
                capture: false,
                once: true,
              });
            }
          },
        }}
      >
        <DialogTitle>
          <IconButton
            onClick={onCloseIconChooserDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Paper elevation={0} sx={{ m: 3, mt: 3 }}>
          <SymbologyIconAutocomplete
            ref={autocompleteInputRef}
            selectedSymbol={
              icon !== undefined ? getIconsMetadataByIconName(icon) : undefined
            }
            onChooseSymbol={onChooseSymbol}
          />
        </Paper>
      </DialogWithTransition>

      <DialogWithTransition
        onClose={onCancel}
        dialogProps={{ fullScreen: false }}
        transitionProps={{
          addEndListener: () => {
            if (textInput.current !== null && textInput.current.value === "") {
              // textInput.current.focus();
            }
          },
        }}
      >
        <DialogTitle>
          Symbol
          <div style={{ position: "absolute", top: "20px", right: "30px" }}>
            {getIconForSymbolForFormPreview(
              { ...getAppDefaultSymbologyConfig(), ...symbol },
              {
                icon,
                colour,
                fill,
                size,
                stroke_width,
                rotation,
                opacity,
              }
            )}
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
            {nameFieldRequired !== false && (
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
                      <TextField
                        {...field}
                        inputRef={textInput}
                        // Makes shouldFocusError work
                        // c.f. https://stackoverflow.com/a/74529792
                        ref={register("name").ref}
                        label="Name"
                      />
                    )}
                  />
                </FormGroup>

                {errors.name && (
                  <FormHelperText error>{errors.name.message}</FormHelperText>
                )}
              </FormControl>
            )}

            {groups !== undefined && (
              <FormControl
                fullWidth={true}
                sx={{ mb: 3 }}
                component="fieldset"
                variant="outlined"
              >
                <FormGroup>
                  <InputLabel id="demo-simple-select-autowidth-label">
                    Group
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-autowidth-label"
                    label="Group"
                    defaultValue={currentGroupId || defaultSymbologyGroupId}
                    onChange={onChooseGroupId}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormGroup>
              </FormControl>
            )}

            <FormControl
              fullWidth={true}
              sx={{ mb: 3, mt: nameFieldRequired !== false ? 0 : 1 }}
              component="fieldset"
              variant="outlined"
            >
              <FormGroup>
                <TextField
                  label="Icon"
                  select
                  value={icon || ""}
                  SelectProps={{
                    open: false,
                    onClick: onOpenIconChooserDialog,
                  }}
                  InputProps={{
                    startAdornment:
                      icon !== undefined ? (
                        <InputAdornment position="start" sx={{ mr: 2 }}>
                          {getIconForSymbolForFormPreview(
                            getAppDefaultSymbologyConfig(),
                            { icon: icon }
                          )}
                        </InputAdornment>
                      ) : undefined,
                  }}
                >
                  {icon !== undefined ? (
                    <MenuItem value={icon}>{icon}</MenuItem>
                  ) : (
                    <MenuItem />
                  )}
                </TextField>
              </FormGroup>

              {errors.icon && (
                <FormHelperText error>{errors.icon.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth={true}
              sx={{ mb: 3, pl: 1, pr: 1 }}
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend">Size</FormLabel>

              <FormGroup>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <SliderFixed
                      {...field}
                      valueLabelDisplay="auto"
                      min={symbolMinimumSize}
                      max={symbolMaximumSize}
                      track={false}
                      step={1}
                      marks={[
                        {
                          value: 1,
                          label: "1",
                        },
                        {
                          value: 25,
                          label: "25",
                        },
                        {
                          value: 50,
                          label: "50",
                        },
                      ]}
                    />
                  )}
                />
              </FormGroup>

              {errors.size && (
                <FormHelperText error>{errors.size.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth={true}
              sx={{ mb: 3, pl: 1, pr: 1 }}
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend">Stroke</FormLabel>

              <FormGroup>
                <Controller
                  name="stroke_width"
                  control={control}
                  render={({ field }) => (
                    <SliderFixed
                      {...field}
                      valueLabelDisplay="auto"
                      min={symbolMinimumStrokeWidth}
                      max={symbolMaximumStrokeWidth}
                      track={false}
                      step={0.1}
                      marks={[
                        {
                          value: 0,
                          label: "0",
                        },
                        {
                          value: 2.5,
                          label: "2.5",
                        },
                        {
                          value: 5,
                          label: "5",
                        },
                      ]}
                    />
                  )}
                />
              </FormGroup>

              {errors.stroke_width && (
                <FormHelperText error>
                  {errors.stroke_width.message}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth={true}
              sx={{ mb: 3, pl: 1, pr: 1 }}
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend">Rotation</FormLabel>

              <FormGroup>
                <Controller
                  name="rotation"
                  control={control}
                  render={({ field }) => (
                    <SliderFixed
                      {...field}
                      valueLabelDisplay="auto"
                      min={symbolMinimumRotation}
                      max={symbolMaximumRotation}
                      track={false}
                      step={10}
                      marks={[
                        {
                          value: 0,
                          label: "0",
                        },
                        {
                          value: 90,
                          label: "90",
                        },
                        {
                          value: 180,
                          label: "180",
                        },
                        {
                          value: 270,
                          label: "270",
                        },
                        {
                          value: 360,
                          label: "360",
                        },
                      ]}
                    />
                  )}
                />
              </FormGroup>

              {errors.rotation && (
                <FormHelperText error>{errors.rotation.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth={true}
              sx={{ mb: 3, pl: 1, pr: 1 }}
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend">Opacity</FormLabel>

              <FormGroup>
                <Controller
                  name="opacity"
                  control={control}
                  render={({ field }) => (
                    <SliderFixed
                      {...field}
                      valueLabelDisplay="auto"
                      min={symbolMinimumOpacity}
                      max={symbolMaximumOpacity}
                      track={false}
                      step={0.1}
                      marks={[
                        {
                          value: 0,
                          label: "0",
                        },
                        {
                          value: 0.25,
                          label: "0.25",
                        },
                        {
                          value: 0.5,
                          label: "0.5",
                        },
                        {
                          value: 0.75,
                          label: "0.75",
                        },
                        {
                          value: 1,
                          label: "1",
                        },
                      ]}
                    />
                  )}
                />
              </FormGroup>

              {errors.opacity && (
                <FormHelperText error>{errors.opacity.message}</FormHelperText>
              )}
            </FormControl>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <FormControl
                fullWidth={true}
                sx={{
                  width: "calc(40%)",
                  textAlign: "center",
                  alignItems: "center",
                  margin: "0 auto",
                }}
                component="fieldset"
                variant="outlined"
              >
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Stroke
                </FormLabel>

                <FormGroup>
                  <input
                    type="color"
                    className="colourPicker"
                    {...register("colour")}
                  />
                </FormGroup>

                {errors.colour && (
                  <FormHelperText error>{errors.colour.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth={true}
                sx={{
                  width: "calc(10%)",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
                component="fieldset"
                variant="outlined"
              >
                <IconButton
                  sx={{ mt: 3 }}
                  onClick={copyStrokeColourToFillColour}
                >
                  <TrendingFlatIcon />
                </IconButton>
              </FormControl>

              <FormControl
                fullWidth={true}
                sx={{
                  width: "calc(40%)",
                  textAlign: "center",
                  alignItems: "center",
                  margin: "0 auto",
                }}
                component="fieldset"
                variant="outlined"
              >
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Fill
                </FormLabel>

                <FormGroup>
                  <input
                    type="color"
                    className="colourPicker"
                    {...register("fill")}
                  />
                </FormGroup>

                {errors.fill && (
                  <FormHelperText error>{errors.fill.message}</FormHelperText>
                )}
              </FormControl>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onClickSave}>Save</Button>
        </DialogActions>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SymbologyFieldEditor;
