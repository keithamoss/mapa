import { Schema } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import MapIcon from "@mui/icons-material/Map";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { Badge, SpeedDialIcon, styled } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction, {
  SpeedDialActionProps,
} from "@mui/material/SpeedDialAction";
import * as React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import { getCountOfFilteredFeatureIds } from "./appSlice";

const SpeedDialActionWithOptionalBadge = (
  props: SpeedDialActionProps & { badgeCount?: number }
) => {
  const { badgeCount, ...rest } = props;

  return (
    <SpeedDialAction
      {...rest}
      icon={
        badgeCount !== undefined && badgeCount >= 1 ? (
          <Badge badgeContent={badgeCount} color="primary">
            {rest.icon}
          </Badge>
        ) : (
          rest.icon
        )
      }
    />
  );
};

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
  {
    icon: (
      <Link to="/SearchManager">
        <SearchIcon color="primary" />
      </Link>
    ),
    name: "Search",
  },
  {
    icon: (
      <Link to="/SettingsManager">
        <SettingsIcon color="primary" />
      </Link>
    ),
    name: "Settings",
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

  const searchResultCount = useAppSelector(getCountOfFilteredFeatureIds);

  return (
    <React.Fragment>
      <Backdrop open={open} />
      <StyledSpeedDial
        ariaLabel="The primary navigation element for the app"
        icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialActionWithOptionalBadge
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={onActionClick(action.name)}
            badgeCount={
              action.name === "Search" ? searchResultCount : undefined
            }
          />
        ))}
      </StyledSpeedDial>
    </React.Fragment>
  );
}
