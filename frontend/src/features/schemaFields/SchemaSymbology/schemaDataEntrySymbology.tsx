import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  FormGroup,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";

import React, { useEffect, useState } from "react";

import { useAppSelector } from "../../../app/hooks/store";
import { useGetFeaturesForMapQuery } from "../../../app/services/features";
import {
  FeatureSchemaSymbologySymbolsValue,
  SymbologyProps,
  useUpdateFeatureSchemaMutation,
} from "../../../app/services/schemas";
import { selectFeatureSchemaById } from "../../schemas/schemasSlice";
import SymbologyFieldEditor from "../../symbology/symbologyFieldEditor";
import {
  addSymbolToGroup,
  defaultSymbolSizeForFormFields,
  defaultSymbologyGroupId,
  getFontAwesomeIconForSymbolPreview,
  getSymbolFromSchemaSymbology,
  modifySymbolInGroup,
} from "../../symbology/symbologyHelpers";
import SchemaSymbologyChooser from "./schemaSymbologyChooser";

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

  // ######################
  // Add Symbol
  // ######################
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
  // Add Symbol (End)
  // ######################

  // ######################
  // Edit Symbol
  // ######################
  const [isEditingSymbol, setIsEditingSymbol] = useState(false);

  const onEditSymbol = () => {
    setIsEditingSymbol(true);
  };

  const onCancelEditingSymbol = () => setIsEditingSymbol(false);

  const onDoneEditingSymbol = (
    symbologyField: SymbologyProps,
    groupId: number
  ) => {
    if (selectedSymbol !== undefined) {
      const local_symbol: FeatureSchemaSymbologySymbolsValue = {
        ...selectedSymbol,
        props: symbologyField,
        group_id: groupId,
      };

      if (schema !== undefined) {
        updateSchema({
          ...schema,
          symbology: modifySymbolInGroup(local_symbol, schema.symbology),
        });

        setIsEditingSymbol(false);
      }
    }
  };
  // ######################
  // Edit Symbol (End)
  // ######################

  // ######################
  // Symbol Chooser Dialog
  // ######################
  const [isSymbolChooserDialogOpen, setIsSymbolChooserDialogOpen] =
    useState(false);

  const onOpenSymbolChooserDialog = () => setIsSymbolChooserDialogOpen(true);

  const onCloseSymbolChooserDialog = () => setIsSymbolChooserDialogOpen(false);
  // ######################
  // Symbol Chooser Dialog (End)
  // ######################

  if (schema === undefined) {
    return null;
  }

  const selectedSymbol =
    symbolId !== null
      ? getSymbolFromSchemaSymbology(symbolId, schema.symbology)
      : undefined;

  return (
    <React.Fragment>
      {isSymbolChooserDialogOpen === true && (
        <SchemaSymbologyChooser
          mapId={mapId}
          schemaId={schema.id}
          symbology={schema.symbology}
          symbolId={symbolId}
          features={features !== undefined ? Object.values(features) : []}
          onChoose={onChooseSymbol}
          onClose={onCloseSymbolChooserDialog}
        />
      )}

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
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  {getFontAwesomeIconForSymbolPreview(selectedSymbol.props, {
                    size: defaultSymbolSizeForFormFields,
                  })}
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
        {selectedSymbol !== undefined && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditSymbol}
            sx={{ mt: 2, mr: 1, maxWidth: 350 }}
          >
            Edit Symbol
          </Button>
        )}

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

      {isEditingSymbol === true && selectedSymbol !== undefined && (
        <SymbologyFieldEditor
          symbol={selectedSymbol.props}
          onDone={onDoneEditingSymbol}
          onCancel={onCancelEditingSymbol}
          groups={schema.symbology.groups}
          currentGroupId={selectedSymbol.group_id}
          nameFieldRequired={true}
          iconFieldRequired={true}
        />
      )}
    </React.Fragment>
  );
}

export default SchemaDataEntrySymbology;
