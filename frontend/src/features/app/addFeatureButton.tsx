import { AddLocationAlt } from "@mui/icons-material";
import { styled } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks/store";
import { useAddFeatureToMapMutation } from "../../app/services/features";
import { initFeatureFromMapCentre } from "../features/featuresSlice";

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

interface Props {
  mapId?: number;
}

export default function AddFeatureButton(props: Props) {
  console.log("### AddFeatureButton ###");

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const { mapId } = props;

  const [addFeature] = useAddFeatureToMapMutation();

  const onAddFeature = React.useCallback(async () => {
    if (mapId !== undefined) {
      const feature = dispatch(initFeatureFromMapCentre(mapId));
      if (feature !== undefined) {
        const newFeature = await addFeature(feature).unwrap();

        navigate(`/FeatureManager/Edit/${newFeature.id}`, {
          state: { isAdding: true },
        });
      }
    }
  }, [addFeature, dispatch, mapId, navigate]);

  return (
    <StyledSpeedDial
      ariaLabel="The primary button to create a new feature"
      icon={<AddLocationAlt />}
      onClick={onAddFeature}
      open={false}
      FabProps={{ disabled: mapId === undefined }}
    />
  );
}
