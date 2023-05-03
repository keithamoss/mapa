import CloseIcon from "@mui/icons-material/Close";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  AppBar,
  Button,
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
  Toolbar,
  Typography,
} from "@mui/material";

import { isEmpty, pickBy } from "lodash-es";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { stopPropagate } from "../../app/forms/formUtils";
import {
  getNumberOrDefaultForSymbologyField,
  getStringOrDefaultForSymbologyField,
  getStringOrEmptyStringForSymbologyField,
  symbolMaximumOpacity,
  symbolMaximumRotation,
  symbolMaximumSize,
  symbolMinimumOpacity,
  symbolMinimumRotation,
  symbolMinimumSize,
  symbologyFormValidationSchema,
} from "../../app/forms/symbologyForm";
import {
  FeatureSchemaSymbologyGroup,
  SymbologyProps,
} from "../../app/services/schemas";
import {
  defaultSymbolColour,
  defaultSymbolIcon,
  defaultSymbolOpacity,
  defaultSymbolRotation,
  defaultSymbolSecondaryColour,
  defaultSymbolSecondaryOpacity,
  defaultSymbolSize,
  defaultSymbolSizeForFormFields,
  defaultSymbologyGroupId,
  getAppDefaultSymbologyConfig,
  getFontAwesomeIconForSymbolPreview,
  getFontAwesomeIconFromLibraryAsSVGImage,
} from "./symbologyHelpers";

import { IconFamily, IconStyle } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import { DialogWithTransition } from "../../app/ui/dialog";
import "./colourPicker.css";
import {
  getDefaultFamilyForIconByName,
  getDefaultStyleForIconByName,
  getIconFamilyAndStyleName,
  getIconLabelByName,
} from "./font-awesome/fontAwesome";
import SliderFixed from "./sliderFixed";
import SymbologyIconChooser from "./symbologyIconChooser";

const getDefaultValues = (symbol: SymbologyProps | null | undefined) => {
  const icon = getStringOrDefaultForSymbologyField(
    symbol,
    "icon",
    defaultSymbolIcon
  );

  const defaultValues = {
    name: getStringOrEmptyStringForSymbologyField(symbol, "name"),
    icon,
    icon_family: getStringOrDefaultForSymbologyField(
      symbol,
      "icon_family",
      getDefaultFamilyForIconByName(icon)
    ),
    icon_style: getStringOrDefaultForSymbologyField(
      symbol,
      "icon_style",
      getDefaultStyleForIconByName(icon)
    ),
    size: getNumberOrDefaultForSymbologyField(
      symbol,
      "size",
      defaultSymbolSize
    ),
    rotation: getNumberOrDefaultForSymbologyField(
      symbol,
      "rotation",
      defaultSymbolRotation
    ),
    colour: getStringOrDefaultForSymbologyField(
      symbol,
      "colour",
      defaultSymbolColour
    ),
    opacity: getNumberOrDefaultForSymbologyField(
      symbol,
      "opacity",
      defaultSymbolOpacity
    ),
    secondary_colour: getStringOrDefaultForSymbologyField(
      symbol,
      "secondary_colour",
      defaultSymbolSecondaryColour
    ),
    secondary_opacity: getNumberOrDefaultForSymbologyField(
      symbol,
      "secondary_opacity",
      defaultSymbolSecondaryOpacity
    ),
  };

  return pickBy(defaultValues, (v) => v !== undefined);
};

export const getAppDefaultSymbologyConfigForForm = () => {
  const defaults = getAppDefaultSymbologyConfig();

  // This UI is all about choosing an icon, so we don't want
  // to delete any defaults props about the icon itself
  delete defaults.icon;
  delete defaults.icon_family;
  delete defaults.icon_style;

  return defaults;
};

const removeDefaultValuesFromForm = (
  data: SymbologyProps,
  nameFieldRequired: boolean,
  iconFieldRequired: boolean
) => {
  const defaults = getAppDefaultSymbologyConfigForForm();

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

  if (data.icon_family !== "duotone") {
    delete data["secondary_colour"];
    delete data["secondary_opacity"];
  }

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

  const {
    icon,
    icon_family,
    icon_style,
    size,
    rotation,
    colour,
    opacity,
    secondary_colour,
    secondary_opacity,
  } = watch();

  const onChooseGroupId = (e: SelectChangeEvent<number>) => {
    const groupId = parseInt(`${e.target.value}`);

    if (Number.isNaN(groupId) === false) {
      setSelectedGroupId(groupId);
    }
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
  // Icon Chooser Dialog
  // ######################
  const [isIconSymbologyChooserOpen, setIsIconSymbologyChooserOpen] =
    useState(false);

  const [openAtFamilyAndStyleChooser, setOpenAtFamilyAndStyleChooser] =
    useState(false);

  const onOpenSymbologyIconChooser = () => {
    setOpenAtFamilyAndStyleChooser(false);
    setIsIconSymbologyChooserOpen(true);
  };

  const onOpenSymbologyIconChooserAtFamilyAndStyleChooser = () => {
    setOpenAtFamilyAndStyleChooser(true);
    setIsIconSymbologyChooserOpen(true);
  };

  const onChooseIconFamilyAndStyleFromSymbologyIconChooser = (
    icon: string,
    icon_family: string,
    icon_style: string
  ) => {
    setValue("icon", icon);
    setValue("icon_family", icon_family);
    setValue("icon_style", icon_style);
    setIsIconSymbologyChooserOpen(false);
  };

  const onCloseSymbologyIconChooser = () =>
    setIsIconSymbologyChooserOpen(false);
  // ######################
  // Icon Chooser Dialog (End)
  // ######################

  return (
    <React.Fragment>
      {isIconSymbologyChooserOpen === true && (
        <SymbologyIconChooser
          selectedIcon={icon}
          selectedIconFamily={icon_family}
          selectedIconStyle={icon_style}
          openAtFamilyAndStyleChooser={openAtFamilyAndStyleChooser}
          onChoose={onChooseIconFamilyAndStyleFromSymbologyIconChooser}
          onClose={onCloseSymbologyIconChooser}
        />
      )}

      <DialogWithTransition onClose={onCancel}>
        <AppBar sx={{ position: "sticky" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onCancel}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Symbol
            </Typography>
            <Button color="inherit" onClick={onClickSave}>
              Save
            </Button>
          </Toolbar>
        </AppBar>

        <form onSubmit={stopPropagate(handleSubmit(onDoneWithForm))}>
          <Paper elevation={0} sx={{ m: 3 }}>
            <Paper
              variant="outlined"
              sx={{ textAlign: "center", mb: 1, pt: 2, pb: 2 }}
            >
              {symbol !== null &&
                getFontAwesomeIconForSymbolPreview(
                  {
                    ...symbol,
                    icon,
                    icon_family,
                    icon_style,
                    colour,
                    secondary_colour,
                    size,
                    rotation,
                    opacity,
                    secondary_opacity,
                  },
                  { size: defaultSymbolSizeForFormFields * 2.5 }
                )}
            </Paper>

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
                  <InputLabel>Group</InputLabel>
                  <Select
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
                    onClick: onOpenSymbologyIconChooser,
                  }}
                  InputProps={{
                    startAdornment:
                      icon !== undefined ? (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          {getFontAwesomeIconFromLibraryAsSVGImage(icon)}
                        </InputAdornment>
                      ) : undefined,
                  }}
                >
                  {icon !== undefined ? (
                    <MenuItem value={icon}>{getIconLabelByName(icon)}</MenuItem>
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
              sx={{ mb: 3 }}
              component="fieldset"
              variant="outlined"
            >
              <FormGroup>
                <TextField
                  label="Style"
                  select
                  value={`${icon_family}_${icon_style}` || ""}
                  SelectProps={{
                    open: false,
                    onClick: onOpenSymbologyIconChooserAtFamilyAndStyleChooser,
                  }}
                  InputProps={{
                    startAdornment:
                      icon !== undefined &&
                      icon_family !== undefined &&
                      icon_style !== undefined ? (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          {getFontAwesomeIconFromLibraryAsSVGImage(
                            icon,
                            icon_family,
                            icon_style
                          )}
                        </InputAdornment>
                      ) : undefined,
                  }}
                >
                  {icon_family !== undefined && icon_style !== undefined ? (
                    <MenuItem value={`${icon_family}_${icon_style}`}>
                      {getIconFamilyAndStyleName(
                        icon_family as IconFamily,
                        icon_style as IconStyle
                      )}
                    </MenuItem>
                  ) : (
                    <MenuItem />
                  )}
                </TextField>
              </FormGroup>

              {errors.icon_family && (
                <FormHelperText error>
                  {errors.icon_family.message}
                </FormHelperText>
              )}

              {errors.icon_style && (
                <FormHelperText error>
                  {errors.icon_style.message}
                </FormHelperText>
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
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Colour and Opacity
              </FormLabel>
            </FormControl>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingLeft: "8px",
                paddingRight: "8px",
                marginBottom: icon_family === "duotone" ? "24px" : "0px",
              }}
            >
              <FormControl
                fullWidth={true}
                sx={{
                  width: "calc(30%)",
                }}
                component="fieldset"
                variant="outlined"
              >
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
                  width: "calc(70%)",
                }}
                component="fieldset"
                variant="outlined"
              >
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
                  <FormHelperText error>
                    {errors.opacity.message}
                  </FormHelperText>
                )}
              </FormControl>
            </div>

            {icon_family === "duotone" && (
              <React.Fragment>
                <FormControl
                  fullWidth={true}
                  component="fieldset"
                  variant="outlined"
                >
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    Secondary Colour and Opacity
                  </FormLabel>
                </FormControl>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                >
                  <FormControl
                    fullWidth={true}
                    sx={{
                      width: "calc(30%)",
                    }}
                    component="fieldset"
                    variant="outlined"
                  >
                    <FormGroup>
                      <input
                        type="color"
                        className="colourPicker"
                        {...register("secondary_colour")}
                      />
                    </FormGroup>

                    {errors.secondary_colour && (
                      <FormHelperText error>
                        {errors.secondary_colour.message}
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth={true}
                    sx={{
                      width: "calc(70%)",
                    }}
                    component="fieldset"
                    variant="outlined"
                  >
                    <FormGroup>
                      <Controller
                        name="secondary_opacity"
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

                    {errors.secondary_opacity && (
                      <FormHelperText error>
                        {errors.secondary_opacity.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              </React.Fragment>
            )}
          </Paper>
        </form>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SymbologyFieldEditor;
