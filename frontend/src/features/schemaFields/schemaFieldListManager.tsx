import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
  alpha,
  styled,
} from "@mui/material";
import React, { useState } from "react";
import {
  FeatureSchemaFieldDefinitionCollection,
  FeatureSchemaFieldTypeLabel,
} from "../../app/services/schemas";
import SchemaFieldDeleteManager from "../schemas/schemaFieldDeleteManager";
import {
  moveFieldDown,
  moveFieldUp,
  removeField,
} from "../schemas/schemaHelpers";
import { getFieldFromSchemaById } from "../schemas/schemasSlice";
import SchemaFieldCreatorAndEditor from "./schemaFieldCreatorAndEditor";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

interface Props {
  schemaId?: number;
  schemaDefinition: FeatureSchemaFieldDefinitionCollection[];
  onSchemaDefinitionChange: (
    definition: FeatureSchemaFieldDefinitionCollection[]
  ) => void;
}

function SchemaFieldListManager(props: Props) {
  console.log("### SchemaFieldListManager ###");

  const { schemaId, schemaDefinition, onSchemaDefinitionChange } = props;

  const [fieldToEdit, setFieldToEdit] = useState<
    FeatureSchemaFieldDefinitionCollection | undefined
  >();

  const onEditField = (fieldId: number) => () => {
    setFieldToEdit(getFieldFromSchemaById(fieldId, schemaDefinition));
  };

  const onDoneEditingField = (
    field: FeatureSchemaFieldDefinitionCollection
  ) => {
    const definition = [...(schemaDefinition || [])];
    const idx = definition?.findIndex((f) => f.id === field.id);

    if (idx !== -1) {
      definition[idx] = field;

      onSchemaDefinitionChange(definition);

      setFieldToEdit(undefined);
    }
  };

  const onCancelEditingField = () => setFieldToEdit(undefined);

  // ######################
  // Menu
  // ######################
  const [fieldIdForMenu, setFieldIdForMenu] = React.useState<number | null>(
    null
  );
  const [fieldIdx, setFieldIdx] = React.useState<number | null>(null);

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(
    null
  );
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenuClick =
    (fieldId: number, idx: number) =>
    (event: React.MouseEvent<HTMLElement>) => {
      setFieldIdForMenu(fieldId);
      setFieldIdx(idx);
      setMenuAnchorEl(event.currentTarget);
    };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };
  // ######################
  // Menu (End)
  // ######################

  // ######################
  // Reorder Field
  // ######################
  const onMoveFieldUp = () => {
    if (fieldIdForMenu !== null) {
      const local_definition = moveFieldUp(fieldIdForMenu, schemaDefinition);
      if (local_definition !== null) {
        onSchemaDefinitionChange(local_definition);
      }
    }
  };

  const onMoveFieldDown = () => {
    if (fieldIdForMenu !== null) {
      const local_definition = moveFieldDown(fieldIdForMenu, schemaDefinition);
      if (local_definition !== null) {
        onSchemaDefinitionChange(local_definition);
      }
    }
  };
  // ######################
  // Reorder Field (End)
  // ######################

  // ######################
  // Delete Field
  // ######################
  const [fieldIdToDelete, setFieldIdToDelete] = useState<number | undefined>(
    undefined
  );

  const onClickDeleteField = (fieldId: number) => () => {
    if (schemaId === undefined) {
      // Schema hasn't been created yet, so we're safe to delete w/o checking
      onSchemaDefinitionChange(removeField(fieldId, schemaDefinition));
      setFieldIdToDelete(undefined);
    } else {
      // SchemaFieldDeleteManager checks the backend for us first to see if we're safe to delete
      setFieldIdToDelete(fieldId);
    }

    handleClose();
  };

  const onDeleteField = (fieldId: number) => {
    onSchemaDefinitionChange(removeField(fieldId, schemaDefinition));
    setFieldIdToDelete(undefined);
  };

  const onCancelDeleteField = () => setFieldIdToDelete(undefined);
  // ######################
  // Delete Field (End)
  // ######################

  return (
    <React.Fragment>
      {schemaId !== undefined && fieldIdToDelete !== undefined && (
        <SchemaFieldDeleteManager
          schemaId={schemaId}
          fieldId={fieldIdToDelete}
          onYes={onDeleteField}
          onNo={onCancelDeleteField}
        />
      )}

      <List>
        {schemaDefinition.map((field, idx) => (
          <ListItem
            key={field.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={handleOpenMenuClick(field.id, idx)}
              >
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={onEditField(field.id)} disableGutters>
              <ListItemText
                primary={field.name}
                secondary={FeatureSchemaFieldTypeLabel[field.type]}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <StyledMenu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleClose}
      >
        {fieldIdx !== null && fieldIdx > 0 && (
          <MenuItem onClick={onMoveFieldUp} disableRipple>
            <ArrowCircleUpIcon />
            Up
          </MenuItem>
        )}

        {fieldIdx !== null && fieldIdx < schemaDefinition.length - 1 && (
          <MenuItem onClick={onMoveFieldDown} disableRipple>
            <ArrowCircleDownIcon />
            Down
          </MenuItem>
        )}

        {fieldIdx !== null && (
          <MenuItem
            onClick={onClickDeleteField(schemaDefinition[fieldIdx].id)}
            disableRipple
          >
            <DeleteIcon />
            Delete
          </MenuItem>
        )}
      </StyledMenu>

      {fieldToEdit !== undefined && (
        <SchemaFieldCreatorAndEditor
          fieldToEdit={fieldToEdit}
          onDoneEditing={onDoneEditingField}
          onCancel={onCancelEditingField}
        />
      )}
    </React.Fragment>
  );
}

export default SchemaFieldListManager;
