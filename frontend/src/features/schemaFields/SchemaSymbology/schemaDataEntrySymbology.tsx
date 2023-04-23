import CloseIcon from "@mui/icons-material/Close";

import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  DialogTitle,
  FormGroup,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useAppSelector } from "../../../app/hooks/store";
import { useGetFeaturesForMapQuery } from "../../../app/services/features";
import {
  FeatureSchemaSymbologySymbolsValue,
  SymbologyProps,
  useUpdateFeatureSchemaMutation,
} from "../../../app/services/schemas";
import { DialogWithTransition } from "../../../app/ui/dialog";
import { selectFeatureSchemaById } from "../../schemas/schemasSlice";
import SymbologyFieldEditor from "../../symbology/symbologyFieldEditor";
import {
  addSymbolToGroup,
  defaultSymbologyGroupId,
  getIconForSymbolForPreview,
  getSymbolFromSchemaSymbologyGroup,
} from "../../symbology/symbologyHelpers";
import SchemaSymbologyAutocomplete from "./schemaSymbologyAutocomplete";

interface Props {
  mapId: number;
  schemaId: number;
  symbolId: number | null;
  onFieldChange: (symbolId: number) => void;
  onFieldRemove: () => void;
}

function SchemaDataEntrySymbology(props: Props) {
  console.log("### SchemaDataEntrySymbology ###");

  const { mapId, schemaId, symbolId, onFieldChange, onFieldRemove } = props;

  const schema = useAppSelector((state) =>
    selectFeatureSchemaById(state, schemaId)
  );

  const { data: features } = useGetFeaturesForMapQuery(mapId);

  const onChooseSymbol = (
    symbol: FeatureSchemaSymbologySymbolsValue | null
  ) => {
    if (symbol !== null) {
      onCloseSymbolChooserDialog();
      onFieldChange(symbol.id);
    } else {
      onFieldRemove();
    }
  };

  const [isAddingSymbol, setIsAddingSymbol] = useState(false);

  const [
    updateSchema,
    {
      isSuccess: isUpdatingSchemaSuccessful,
      // isLoading: isUpdatingSchemaLoading,
    },
  ] = useUpdateFeatureSchemaMutation();

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isUpdatingSchemaSuccessful === true) {
      setIsAddingSymbol(false);
    }
  }, [isUpdatingSchemaSuccessful]);

  const onAddSymbol = () => {
    setIsAddingSymbol(true);
  };

  const onDoneAddingSymbol = (
    symbologyField: SymbologyProps,
    groupId: number
  ) => {
    if (schema !== undefined) {
      const [local_symbology, newSymbolId] = addSymbolToGroup(
        symbologyField,
        schema.symbology,
        groupId
      );

      updateSchema({
        ...schema,
        symbology: local_symbology,
      });

      onFieldChange(newSymbolId);
    }
  };

  const onCancelAddingSymbol = () => {
    setIsAddingSymbol(false);
  };

  // ######################
  // Symbol Chooser Dialog
  // ######################
  const [isSymbolChooserDialogOpen, setIsSymbolChooserDialogOpen] =
    useState(false);

  const onOpenSymbolChooserDialog = () => setIsSymbolChooserDialogOpen(true);

  const onCloseSymbolChooserDialog = () => setIsSymbolChooserDialogOpen(false);

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

  if (schema === undefined) {
    return null;
  }

  const selectedSymbol =
    symbolId !== null
      ? getSymbolFromSchemaSymbologyGroup(symbolId, schema.symbology)
      : undefined;

  return (
    <React.Fragment>
      <DialogWithTransition
        dialogProps={{ open: isSymbolChooserDialogOpen }}
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
            onClick={onCloseSymbolChooserDialog}
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
          <SchemaSymbologyAutocomplete
            ref={autocompleteInputRef}
            mapId={mapId}
            schemaId={schema.id}
            symbology={schema.symbology}
            symbolId={symbolId}
            features={features !== undefined ? Object.values(features) : []}
            onChooseSymbol={onChooseSymbol}
          />
        </Paper>
      </DialogWithTransition>

      <FormGroup>
        <TextField
          label="Choose a symbol"
          select
          value={selectedSymbol?.id || ""}
          SelectProps={{
            open: false,
            onClick: onOpenSymbolChooserDialog,
          }}
          InputProps={{
            startAdornment:
              selectedSymbol !== undefined ? (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  {getIconForSymbolForPreview(selectedSymbol.props)}
                </InputAdornment>
              ) : undefined,
          }}
        >
          {selectedSymbol !== undefined ? (
            <MenuItem value={selectedSymbol.id}>
              {selectedSymbol.props.name}
            </MenuItem>
          ) : (
            <MenuItem />
          )}
        </TextField>
      </FormGroup>

      <FormGroup row={true}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddSymbol}
          sx={{ mt: 2, maxWidth: 350 }}
        >
          Add Symbol
        </Button>
      </FormGroup>

      {isAddingSymbol === true && (
        <SymbologyFieldEditor
          onDone={onDoneAddingSymbol}
          onCancel={onCancelAddingSymbol}
          groups={schema.symbology.groups}
          currentGroupId={defaultSymbologyGroupId}
          nameFieldRequired={true}
          iconFieldRequired={true}
        />
      )}
    </React.Fragment>
  );
}

export default SchemaDataEntrySymbology;
