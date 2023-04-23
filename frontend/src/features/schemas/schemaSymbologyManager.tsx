import FavoriteIcon from "@mui/icons-material/Favorite";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  Button,
  ButtonGroup,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import React, { useState } from "react";
import {
  FeatureSchemaSymbology,
  FeatureSchemaSymbologyGroup,
  FeatureSchemaSymbologySymbolsValue,
  SymbologyProps,
} from "../../app/services/schemas";
import SymbologyFieldEditor from "../symbology/symbologyFieldEditor";
import {
  defaultSymbologyGroupId,
  getIconForSymbolForPreview,
  getSymbolGroups,
  getSymbologyGroupById,
  getSymbolsForGroup,
} from "../symbology/symbologyHelpers";
import SchemaSymbologyGroupEditor from "./schemaSymbologyGroupEditor";

interface Props {
  symbology: FeatureSchemaSymbology;
  mapId?: number;
  onAddGroup: (groupName: string) => void;
  onEditGroup: (groupId: number, groupName: string) => void;
  onAddObject: (symbol: SymbologyProps, groupId: number) => void;
  onEditObject: (symbol: FeatureSchemaSymbologySymbolsValue) => void;
  onDeleteObject: (symbolId: number, groupId: number) => void;
  onFavouriteSymbol: (symbolId: number) => void;
  onUnfavouriteSymbol: (symbolId: number) => void;
}

function SchemaSymbologyManager(props: Props) {
  console.log("### SchemaSymbologyManager ###");

  const {
    symbology,
    mapId,
    onAddGroup,
    onEditGroup,
    onAddObject,
    onEditObject,
    // onDeleteObject,
    onFavouriteSymbol,
    onUnfavouriteSymbol,
  } = props;

  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const onAddNewGroup = () => {
    setIsAddingGroup(true);
  };

  const onDoneAddingGroup = (groupName: string) => {
    onAddGroup(groupName);
    setIsAddingGroup(false);
  };

  const onCancelAddingGroup = () => {
    setIsAddingGroup(false);
  };

  const [groupForEditing, setGroupForEditing] =
    useState<FeatureSchemaSymbologyGroup | null>(null);

  const onClickEditGroup = (groupId: number) => () => {
    setGroupForEditing(getSymbologyGroupById(groupId, symbology));
  };

  const onDoneEditingGroup = (groupName: string) => {
    if (groupForEditing !== null) {
      onEditGroup(groupForEditing.id, groupName);
      setGroupForEditing(null);
    }
  };

  const onCancelEditingGroup = () => {
    setGroupForEditing(null);
  };

  const [isAddingSymbologyField, setIsAddingSymbologyField] = useState(false);

  const [groupIdForNewSymbologyField, setGroupIdForNewSymbologyField] =
    useState<number | undefined>();

  const onAddSymbologyField = (groupId: number) => () => {
    setGroupIdForNewSymbologyField(groupId);
    setIsAddingSymbologyField(true);
  };

  const onDoneAddingSymbol = (
    symbologyField: SymbologyProps,
    groupId: number
  ) => {
    onAddObject(symbologyField, groupId);

    setGroupIdForNewSymbologyField(undefined);
    setIsAddingSymbologyField(false);
  };

  const onCancelAddingSymbol = () => {
    setGroupIdForNewSymbologyField(undefined);
    setIsAddingSymbologyField(false);
  };

  const [symbolFieldForEditor, setSymbolFieldForEditor] = useState<
    FeatureSchemaSymbologySymbolsValue | undefined
  >();

  const onEditSymbol = (symbol: FeatureSchemaSymbologySymbolsValue) => () => {
    setSymbolFieldForEditor(symbol);
  };

  const onCancelEditingSymbol = () => setSymbolFieldForEditor(undefined);

  const onDoneEditingSymbol = (
    symbologyField: SymbologyProps,
    groupId: number
  ) => {
    if (symbolFieldForEditor !== undefined) {
      const local_symbol: FeatureSchemaSymbologySymbolsValue = {
        ...symbolFieldForEditor,
        props: symbologyField,
        group_id: groupId,
      };
      onEditObject(local_symbol);

      setSymbolFieldForEditor(undefined);
    }
  };

  const onClickFavouriteSymbol = (symbolId: number) => () => {
    if (Number.isNaN(symbolId) === false) {
      onFavouriteSymbol(symbolId);
    }
  };

  const onClickUnfavouriteSymbol = (symbolId: number) => () => {
    if (Number.isNaN(symbolId) === false) {
      onUnfavouriteSymbol(symbolId);
    }
  };

  //   const onDeleteSymbol = (e: any) => {
  //     // eslint-disable-next-line no-restricted-globals
  //     if (confirm("Are you sure?") === true) {
  //       const symbolId = parseInt(e.target.dataset.symbolId);
  //       const groupId = parseInt(e.target.dataset.groupId);

  //       if (Number.isNaN(symbolId) === false && Number.isNaN(groupId) === false) {
  //         onDeleteObject(symbolId, groupId);
  //       }
  //     }
  //   };

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddNewGroup}
        sx={{ mt: 1, maxWidth: 350 }}
      >
        Create Group
      </Button>

      <List>
        {getSymbolGroups(symbology).map((symbologyGroup, idx) => (
          <React.Fragment key={symbologyGroup.id}>
            <ListSubheader
              sx={{ mt: idx > 0 ? 3 : 0 }}
              color="primary"
              disableGutters
            >
              {symbologyGroup.name}
            </ListSubheader>

            <ButtonGroup variant="text" fullWidth sx={{ mb: 1 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={onAddSymbologyField(symbologyGroup.id)}
              >
                Add
              </Button>
              <Button
                startIcon={<EditIcon />}
                onClick={onClickEditGroup(symbologyGroup.id)}
                disabled={symbologyGroup.id === defaultSymbologyGroupId}
              >
                Edit
              </Button>
              <Button startIcon={<DeleteIcon />} disabled={true}>
                Delete
              </Button>
            </ButtonGroup>

            {getSymbolsForGroup(symbologyGroup.id, symbology).map((symbol) => (
              <ListItem
                key={symbol.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" disabled={true}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {mapId !== undefined &&
                symbol.favourited_map_ids.includes(mapId) === true ? (
                  <ListItemIcon onClick={onClickUnfavouriteSymbol(symbol.id)}>
                    <FavoriteIcon sx={{ color: pink[500] }} />
                  </ListItemIcon>
                ) : (
                  <ListItemIcon onClick={onClickFavouriteSymbol(symbol.id)}>
                    <FavoriteBorderIcon />
                  </ListItemIcon>
                )}

                <ListItemButton onClick={onEditSymbol(symbol)} disableGutters>
                  {getIconForSymbolForPreview(symbol.props)}
                  <ListItemText primary={symbol.props.name} sx={{ pl: 1 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>

      {isAddingSymbologyField === true && (
        <SymbologyFieldEditor
          onDone={onDoneAddingSymbol}
          onCancel={onCancelAddingSymbol}
          groups={symbology.groups}
          currentGroupId={groupIdForNewSymbologyField}
          nameFieldRequired={true}
          iconFieldRequired={true}
        />
      )}

      {symbolFieldForEditor !== undefined && (
        <SymbologyFieldEditor
          symbol={symbolFieldForEditor.props}
          onDone={onDoneEditingSymbol}
          onCancel={onCancelEditingSymbol}
          groups={symbology.groups}
          currentGroupId={symbolFieldForEditor.group_id}
          nameFieldRequired={true}
          iconFieldRequired={true}
        />
      )}

      {isAddingGroup === true && (
        <SchemaSymbologyGroupEditor
          onDone={onDoneAddingGroup}
          onCancel={onCancelAddingGroup}
        />
      )}

      {groupForEditing !== null && (
        <SchemaSymbologyGroupEditor
          group={groupForEditing}
          onDone={onDoneEditingGroup}
          onCancel={onCancelEditingGroup}
        />
      )}
    </React.Fragment>
  );
}

export default SchemaSymbologyManager;
