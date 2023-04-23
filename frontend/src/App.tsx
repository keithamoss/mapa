import GoogleIcon from "@mui/icons-material/Google";
import { Button, styled } from "@mui/material";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import WelcomeUser from "./WelcomeUser";
import { useAppSelector } from "./app/hooks/store";
import { mapsApi } from "./app/services/maps";
import { featureSchemasApi } from "./app/services/schemas";
import { store } from "./app/store";
import AddFeatureButton from "./features/app/addFeatureButton";
import { selectActiveMapId } from "./features/app/appSlice";
import SpeedDialNavigation from "./features/app/speedDialNavigation";
import { isUserLoggedIn, selectUser } from "./features/auth/authSlice";
import OLMap from "./features/ol_map/olMap";

const LoginContainer = styled("div")`
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  console.log("### App ###");

  const location = useLocation();

  const mapId = useAppSelector(selectActiveMapId);

  const user = useAppSelector(selectUser);

  const isLoggedIn = useAppSelector(isUserLoggedIn);

  if (isLoggedIn === undefined) {
    return null;
  }

  if (user === null) {
    return (
      <LoginContainer>
        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={() => (window.location.href = "/api/login/google-oauth2/")}
        >
          Login
        </Button>
      </LoginContainer>
    );
  }

  // This is the better approach because usePrefetch() runs into "you can't call hooks conditionally"
  // Important: We're pre-fetching after we have a user object to avoid 403s
  store.dispatch(mapsApi.endpoints.getMaps.initiate());
  store.dispatch(featureSchemasApi.endpoints.getFeatureSchemas.initiate());

  return (
    <div className="App">
      {mapId !== undefined && <OLMap mapId={mapId} />}

      {location.pathname === "/" && (
        <React.Fragment>
          {mapId === undefined && <WelcomeUser />}

          <AddFeatureButton mapId={mapId} />

          <SpeedDialNavigation mapId={mapId} />
        </React.Fragment>
      )}

      <Outlet />
    </div>
  );
}

export default App;
