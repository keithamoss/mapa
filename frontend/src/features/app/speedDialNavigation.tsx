import { Schema } from "@mui/icons-material";
import MapIcon from "@mui/icons-material/Map";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import * as React from "react";
import { Link } from "react-router-dom";

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(11),
  right: theme.spacing(2),
  // Ensures that the SVG icons inside <Link /> elements display centred inside their wee circles
  "& svg": {
    display: "block",
  },
}));

const actions = [
  {
    icon: (
      <Link to="/MapManager">
        <MapIcon color="primary" />
      </Link>
    ),
    name: "Maps",
  },
  {
    icon: (
      <Link to="/SchemaManager">
        <Schema color="primary" />
      </Link>
    ),
    name: "Schemas",
  },
];

interface Props {
  mapId?: number;
}

export default function SpeedDialNavigation(props: Props) {
  console.log("### SpeedDialNavigation ###");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const onActionClick = (actionName: string) => () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Backdrop open={open} />
      <StyledSpeedDial
        ariaLabel="The primary navigation element for the app"
        icon={<MenuIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={onActionClick(action.name)}
          />
        ))}
      </StyledSpeedDial>
    </React.Fragment>
  );
}
