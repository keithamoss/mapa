import VisibilityIcon from "@mui/icons-material/Visibility";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Divider from "@mui/material/Divider";

import {
  AppBar,
  Button,
  IconButton,
  List,
  ListItemButton,
  Toolbar,
} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import { useUpdateUserProfileMutation } from "../../app/services/auth";
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectActiveMapId } from "../app/appSlice";
import { selectAllMaps } from "./mapsSlice";

interface Props {}

function MapManager(props: Props) {
  console.log("### MapManager ###");

  const mapId = useAppSelector(selectActiveMapId);

  const maps = useAppSelector(selectAllMaps);

  const navigate = useNavigate();

  const [
    updateUserProfile,
    {
      isSuccess: isUpdatingUpdateUserProfileSuccessful,
      // isLoading: isUpdatingUpdateUserProfileLoading,
    },
  ] = useUpdateUserProfileMutation();

  const onSwitchMap = (mapId: number) => () => {
    updateUserProfile({ last_map_id: mapId });
  };

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isUpdatingUpdateUserProfileSuccessful === true) {
      navigate("/");
    }
  }, [isUpdatingUpdateUserProfileSuccessful, navigate]);

  // if (isUpdatingUpdateUserProfileSuccessful === true) {
  //   navigate("/");
  // }

  // Downside of this is it was conflicting with ControlPanel re-rendering.
  // React was warning about multiple components re-rendering at the same tiem
  // and advised to look for the 'bad setState call'.
  // I think the docs describe how to do this properly, so let's revisit later.
  //   if (isUpdatingUpdateUserProfileSuccessful === true) {
  //     console.log("isUpdatingUpdateUserProfileSuccessful");
  //     // navigate("/");
  //   }

  const onClose = () => navigate("/");

  const onCreate = () => navigate("/MapManager/Create");

  return (
    <DialogWithTransition onClose={onClose}>
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Maps
          </Typography>
          <Button color="inherit" onClick={onCreate}>
            Create
          </Button>
        </Toolbar>
      </AppBar>

      <List>
        {maps.map((map) => (
          <React.Fragment key={map.id}>
            <ListItem
              secondaryAction={
                <Link to={`/MapManager/Edit/${map.id}/`}>
                  <IconButton edge="end">
                    <EditIcon />
                  </IconButton>
                </Link>
              }
              disablePadding
            >
              <ListItemButton onClick={onSwitchMap(map.id)}>
                <ListItemIcon>
                  {map.id === mapId && <VisibilityIcon color="primary" />}
                </ListItemIcon>
                <ListItemText primary={map.name} />
              </ListItemButton>
            </ListItem>

            <Divider />
          </React.Fragment>
        ))}
      </List>
    </DialogWithTransition>
  );
}

export default MapManager;
