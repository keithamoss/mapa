import CloseIcon from "@mui/icons-material/Close";
import ForkRightIcon from "@mui/icons-material/ForkRight";
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import { usePatchMapMutation } from "../../app/services/maps";
import {
  FeatureSchema,
  FeatureSchemaModifiableProps,
  useAddFeatureSchemaMutation,
} from "../../app/services/schemas";
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectActiveMapId } from "../app/appSlice";
import { selectMapById } from "../maps/mapsSlice";
import { selectAllFeatureSchemas } from "./schemasSlice";

interface Props {}

function SchemaManager(props: Props) {
  console.log("### SchemaManager ###");

  const schemas = useAppSelector(selectAllFeatureSchemas);

  const navigate = useNavigate();

  const mapId = useAppSelector(selectActiveMapId);
  const map = useAppSelector((state) =>
    mapId !== undefined ? selectMapById(state, mapId) : undefined
  );

  const onClickSchema = (schemaId: number) => () =>
    navigate(`/SchemaManager/Edit/${schemaId}/`);

  const onClose = () => navigate("/");

  const onCreate = () => navigate("/SchemaManager/Create");

  // ######################
  // Fork Schema
  // ######################
  const onForkSchema = (schema: FeatureSchema) => async () => {
    const forkedSchema: FeatureSchemaModifiableProps = {
      name: `${schema.name} (Forked)`,
      definition: schema.definition,
      symbology: schema.symbology,
      default_symbology: schema.default_symbology,
    };

    const newSchema = await addSchema(forkedSchema).unwrap();

    if (mapId !== undefined && map !== undefined) {
      patchMap({
        id: mapId,
        available_schema_ids: [...map.available_schema_ids, newSchema.id],
      });
    }
  };

  const [addSchema] = useAddFeatureSchemaMutation();

  const [patchMap] = usePatchMapMutation();
  // ######################
  // Fork Schema (End)
  // ######################

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
                <IconButton edge="end" onClick={onForkSchema(schema)}>
                  <ForkRightIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton onClick={onClickSchema(schema.id)}>
                <ListItemText primary={schema.name} inset />
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
