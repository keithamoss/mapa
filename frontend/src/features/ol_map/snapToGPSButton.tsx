import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import { Avatar, IconButton, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
}));

interface Props {
  isFollowingGPS: boolean;
  onFollowGPSEnabled: () => void;
  onFollowGPSDisabled: () => void;
}

function SnapToGPSButton(props: Props) {
  console.log("### SnapToGPSButton ###");

  const { isFollowingGPS, onFollowGPSEnabled, onFollowGPSDisabled } = props;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isFollowingGPS === true) {
      onFollowGPSDisabled();
    } else if (isFollowingGPS === false) {
      onFollowGPSEnabled();
    }
  };

  return (
    <StyledIconButton onClick={handleClick} size="small">
      <Avatar sx={{ bgcolor: grey[400] }}>
        {isFollowingGPS === true ? <GpsFixedIcon /> : <GpsOffIcon />}
      </Avatar>
    </StyledIconButton>
  );
}

export default React.memo(SnapToGPSButton);
