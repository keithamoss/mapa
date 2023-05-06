import CloseIcon from "@mui/icons-material/Close";
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
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectAllFeatureSchemas } from "./schemasSlice";

interface Props {}

function SchemaManager(props: Props) {
  console.log("### SchemaManager ###");

  const schemas = useAppSelector(selectAllFeatureSchemas);

  const navigate = useNavigate();

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
            <ListItem disablePadding>
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
