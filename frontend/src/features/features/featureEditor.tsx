import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightIcon from "@mui/icons-material/Flight";
import {
  AppBar,
  Button,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NotFound from "../../NotFound";
import { useAppSelector } from "../../app/hooks/store";
import { getIntegerParamOrUndefined } from "../../app/routing/routingHelpers";
import {
  Feature,
  FeatureDataItem,
  useDeleteFeatureMutation,
  useUpdateFeatureMutation,
} from "../../app/services/features";
import { usePatchMapMutation } from "../../app/services/maps";
import {
  FeatureSchema,
  FeatureSchemaFieldType,
} from "../../app/services/schemas";
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectActiveMapId } from "../app/appSlice";
import SchemaDataEntrySymbology from "../schemaFields/SchemaSymbology/schemaDataEntrySymbology";
import SchemaFieldDataEntryManager from "../schemaFields/schemaFieldDataEntryManager";
import SchemaFieldSummaryPanel from "../schemaFields/schemaFieldSummaryPanel";
import { SchemaEditor } from "../schemas/schemaEditor";
import SchemaSelectFormControls from "../schemas/schemaSelectFormControls";
import { getSchemasAvailableForMap } from "../schemas/schemasSlice";
import { getFeatureDataItemForSchemaField } from "./featureHelpers";
import { selectFeatureById } from "./featuresSlice";

function FeatureEditorEntrypoint() {
  const params = useParams();
  const featureId = getIntegerParamOrUndefined(params, "featureId");

  const mapId = useAppSelector(selectActiveMapId);

  if (featureId === undefined || mapId === undefined) {
    return <NotFound />;
  }

  const feature = selectFeatureById(mapId, featureId);

  if (feature !== undefined) {
    return <FeatureEditor mapId={mapId} feature={feature} />;
  }

  return null;
}

const areAllRequiredFieldsFilled = (
  feature: Feature,
  schema?: FeatureSchema
) => {
  let isValid = true;

  if (schema !== undefined) {
    schema.definition.forEach((fieldDefinition) => {
      if (
        fieldDefinition.type === FeatureSchemaFieldType.TextField &&
        fieldDefinition.required_field === true
      ) {
        const dataItem = getFeatureDataItemForSchemaField(
          fieldDefinition,
          feature
        );

        if (dataItem === undefined || dataItem.value === "") {
          isValid = false;
        }
      }
    });
  }

  return isValid;
};

interface LocationState {
  isAdding?: boolean;
}

interface Props {
  mapId: number;
  feature: Feature;
}

function FeatureEditor(props: Props) {
  console.log("### FeatureEditor ###");

  const navigate = useNavigate();

  const location = useLocation();
  const isAddingNewFeature = (location.state as LocationState)?.isAdding;

  const { mapId, feature } = props;

  const [localFeature, setLocalFeature] = useState(feature);

  const [
    updateFeature,
    {
      isSuccess: isUpdatingFeatureSuccessful,
      // isLoading: isUpdatingFeatureLoading,
    },
  ] = useUpdateFeatureMutation();

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isUpdatingFeatureSuccessful === true) {
      navigate("/");
    }
  }, [isUpdatingFeatureSuccessful, navigate]);

  const [patchMap] = usePatchMapMutation();

  const [deleteFeature, { isSuccess: isDeleteFeatureSuccessful }] =
    useDeleteFeatureMutation();

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isDeleteFeatureSuccessful === true) {
      navigate("/");
    }
  }, [isDeleteFeatureSuccessful, navigate]);

  const [schemaIdForEditing, setSchemaIdForEditing] = useState<
    number | undefined
  >();

  const onEditSchema = (schemaId: number) => {
    setSchemaIdForEditing(schemaId);
  };

  const onDoneEditingSchema = () => {
    setSchemaIdForEditing(undefined);
  };

  const availableSchemas = useAppSelector((state) =>
    getSchemasAvailableForMap(state, mapId)
  );

  // If we've only got one schema, let's just choose it.
  // Note: We do this here, as well as on feature creation, to handle first time users who don't have any schemas at all when they create their feature.
  useEffect(() => {
    if (localFeature.schema_id === null && availableSchemas.length === 1) {
      setLocalFeature({
        ...localFeature,
        schema_id: availableSchemas[0].id,
        data: [],
      });
    }
  }, [availableSchemas, localFeature]);

  const onChooseSchema = (schemaId: number | null) => {
    setLocalFeature({
      ...localFeature,
      schema_id: schemaId,
      data: [],
    });
  };

  // Adding or updating the value of a data field defined on the schema
  const onChangeField = (featureDataItem: FeatureDataItem) => {
    const data = [...(localFeature.data || [])];
    const idx = data.findIndex(
      (f) => f.schema_field_id === featureDataItem.schema_field_id
    );

    if (idx !== -1) {
      data[idx] = featureDataItem;
    } else {
      data.push(featureDataItem);
    }

    setLocalFeature({
      ...localFeature,
      data,
    });
  };

  // Deleting a field defined on the schema, so we remove this item from the feature's data
  // e.g. The user has set a text field to blank that previously had some text in it
  const onRemoveField = (schemaFieldId: number) => {
    const data = (localFeature.data || []).filter(
      (f) => f.schema_field_id !== schemaFieldId
    );

    setLocalFeature({
      ...localFeature,
      data,
    });
  };

  const onDoneForEditor = () => {
    if (
      areAllRequiredFieldsFilled(
        localFeature,
        availableSchemas.find((s) => s.id === localFeature.schema_id)
      ) === true
    ) {
      updateFeature(localFeature);

      if (localFeature.schema_id !== null) {
        patchMap({
          id: mapId,
          last_used_schema_id: localFeature.schema_id,
        });
      }
    } else {
      alert("One or more required fields remain unfilled");
    }
  };

  const onCancelForEditor = () => {
    if (isAddingNewFeature === true) {
      deleteFeature(feature.id);
    } else {
      navigate(-1);
    }
  };

  const onSymbolChange = (symbolId: number) => {
    setLocalFeature({
      ...localFeature,
      symbol_id: symbolId,
    });
  };

  const onSymbolRemove = () => {
    setLocalFeature({
      ...localFeature,
      symbol_id: null,
    });
  };

  const onDeleteFeature = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure?") === true) {
      deleteFeature(feature.id);
    }
  };

  return (
    <DialogWithTransition
    // For some reason this was causing the dialog to close as soon as it opened when the feature had no schema selected
    // onClose={onCancelForEditor}
    >
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onCancelForEditor}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit Feature
          </Typography>
          <Button color="inherit" onClick={onDoneForEditor}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Paper elevation={0} sx={{ m: 3, mt: 2 }}>
        {localFeature.data.length >= 1 && (
          <FormControl
            fullWidth={true}
            sx={{ mb: 2 }}
            component="fieldset"
            variant="outlined"
          >
            <FormLabel component="legend">Feature Info</FormLabel>

            {localFeature.schema_id !== null && (
              <SchemaFieldSummaryPanel
                schemaId={localFeature.schema_id}
                feature={localFeature}
              />
            )}
          </FormControl>
        )}

        <FormControl
          fullWidth={true}
          sx={{ mb: 3 }}
          component="fieldset"
          variant="outlined"
        >
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Schema
          </FormLabel>

          <SchemaSelectFormControls
            mapId={mapId}
            selectedSchemaId={localFeature.schema_id || undefined}
            onChooseSchema={onChooseSchema}
            onClickEditSchema={onEditSchema}
          />
        </FormControl>

        {localFeature.schema_id !== null && (
          <React.Fragment>
            <FormControl
              fullWidth={true}
              sx={{ mb: 3 }}
              component="fieldset"
              variant="outlined"
            >
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Symbology
              </FormLabel>

              <SchemaDataEntrySymbology
                mapId={mapId}
                schemaId={localFeature.schema_id}
                symbolId={localFeature.symbol_id}
                onFieldChange={onSymbolChange}
                onFieldRemove={onSymbolRemove}
              />
            </FormControl>

            <SchemaFieldDataEntryManager
              schemaId={localFeature.schema_id}
              feature={localFeature}
              onFieldChange={onChangeField}
              onFieldRemove={onRemoveField}
            />
          </React.Fragment>
        )}

        <FormControl sx={{ mb: 3 }} component="fieldset" variant="outlined">
          <Grid container direction="column" sx={{ mt: 1, mb: 2 }}>
            <Grid container direction="row" alignItems="center">
              <Grid item sx={{ mr: 0.5, flexGrow: 1 }}>
                <FormLabel component="legend">Danger Zone</FormLabel>
              </Grid>
              <Grid item>
                <FlightIcon
                  sx={{
                    verticalAlign: "middle",
                    color: "rgb(0, 0, 0)",
                    opacity: 0.5,
                    fontSize: "16px",
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon color="error" />}
            onClick={onDeleteFeature}
            sx={{ maxWidth: 350 }}
          >
            Delete
          </Button>
        </FormControl>
      </Paper>

      {schemaIdForEditing !== undefined && (
        <DialogWithTransition onClose={onCancelForEditor}>
          <SchemaEditor
            schemaId={schemaIdForEditing}
            onDoneEditingSchema={onDoneEditingSchema}
            onCancelEditing={onDoneEditingSchema}
          />
        </DialogWithTransition>
      )}
    </DialogWithTransition>
  );
}

export default FeatureEditorEntrypoint;
