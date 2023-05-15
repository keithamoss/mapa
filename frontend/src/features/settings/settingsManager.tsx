import CloseIcon from "@mui/icons-material/Close";
import {
  AppBar,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import {
  MapRenderer,
  useUpdateUserProfileMutation,
} from "../../app/services/auth";
import { DialogWithTransition } from "../../app/ui/dialog";
import { selectUser } from "../auth/authSlice";

interface Props {}

function SettingsManager(props: Props) {
  console.log("### SettingsManager ###");

  const user = useAppSelector(selectUser);

  const navigate = useNavigate();

  const [
    updateUserProfile,
    {
      isSuccess: isUpdatingUpdateUserProfileSuccessful,
      // isLoading: isUpdatingUpdateUserProfileLoading,
    },
  ] = useUpdateUserProfileMutation();

  // See note in MapEditor about usage of useEffect
  useEffect(() => {
    if (isUpdatingUpdateUserProfileSuccessful === true) {
      window.location.href = "/";
    }
  }, [isUpdatingUpdateUserProfileSuccessful, navigate]);

  const onMapRendererChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    if (value in MapRenderer) {
      updateUserProfile({ map_renderer: value as MapRenderer });
    }
  };

  const onClose = () => navigate("/");

  return (
    <React.Fragment>
      <DialogWithTransition onClose={onClose}>
        <AppBar sx={{ position: "sticky" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Settings
            </Typography>
          </Toolbar>
        </AppBar>

        <Paper elevation={0} sx={{ m: 3 }}>
          <FormControl>
            <FormLabel id="radio-buttons-group-label">Map Renderer</FormLabel>
            <RadioGroup
              aria-labelledby="radio-buttons-group-label"
              defaultValue={user?.settings.map_renderer || "WebGLPointsLayer"}
              name="radio-buttons-group"
              onChange={onMapRendererChange}
            >
              <FormControlLabel
                value="WebGLPointsLayer"
                control={<Radio />}
                label="WebGLPointsLayer"
              />
              <FormControlLabel
                value="VectorImageLayer"
                control={<Radio />}
                label="VectorImageLayer"
              />
            </RadioGroup>
          </FormControl>
        </Paper>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SettingsManager;
