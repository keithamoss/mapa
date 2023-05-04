import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  AppBar,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import { usePatchMapMutation } from "../../app/services/maps";
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectActiveMap } from "../app/appSlice";
import { selectAllFeatureSchemas } from "./schemasSlice";

interface Props {}

function SchemaManager(props: Props) {
  console.log("### SchemaManager ###");

  const schemas = useAppSelector(selectAllFeatureSchemas);

  const map = useAppSelector(selectActiveMap);

  const navigate = useNavigate();

  const [patchMap] = usePatchMapMutation();

  const onToggleSchemaVisibility = (schemaId: number) => (event: any) => {
    // @TODO Don't worry about the 'any' for now, we'll rewrite this bit of the UI soonish
    event.stopPropagation();

    if (map !== undefined) {
      if (map.hidden_schema_ids.includes(schemaId) === false) {
        patchMap({
          id: map.id,
          hidden_schema_ids: [...(map.hidden_schema_ids || []), schemaId],
        });
      } else {
        patchMap({
          id: map.id,
          hidden_schema_ids: map.hidden_schema_ids.filter(
            (schema_id) => schema_id !== schemaId
          ),
        });
      }
    }
  };

  const onClickSchema = (schemaId: number) => () =>
    navigate(`/SchemaManager/Edit/${schemaId}/`);

  const onClose = () => navigate("/");

  const onCreate = () => navigate("/SchemaManager/Create");

  return (
    <DialogWithTransition onClose={onClose}>
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Schemas
          </Typography>
          <Button color="inherit" onClick={onCreate}>
            Create
          </Button>
        </Toolbar>
      </AppBar>

      <List>
        {schemas.map((schema) => (
          <React.Fragment key={schema.id}>
            <ListItem
              secondaryAction={
                <Link to={`/SchemaManager/Edit/${schema.id}/`}>
                  <IconButton edge="end">
                    <EditIcon />
                  </IconButton>
                </Link>
              }
              disablePadding
            >
              <ListItemButton onClick={onClickSchema(schema.id)}>
                <ListItemIcon>
                  {map !== undefined && (
                    <Checkbox
                      edge="start"
                      checked={
                        map.hidden_schema_ids.includes(schema.id) === false
                      }
                      onClick={onToggleSchemaVisibility(schema.id)}
                      disableRipple
                    />
                  )}
                </ListItemIcon>

                <ListItemText primary={schema.name} />
              </ListItemButton>
            </ListItem>

            <Divider />
          </React.Fragment>
        ))}
      </List>
    </DialogWithTransition>
  );
}

export default SchemaManager;
