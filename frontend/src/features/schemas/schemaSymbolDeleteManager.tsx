import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useAppSelector } from "../../app/hooks/store";
import { useCheckCanDeleteSymbolQuery } from "../../app/services/schemas";
import { selectAllMaps } from "../maps/mapsSlice";

interface Props {
  schemaId: number;
  symbolId: number;
  onYes: (symbolId: number) => void;
  onNo: () => void;
}

function SchemaSymbolDeleteManager(props: Props) {
  console.log("### SchemaSymbolDeleteManager ###");

  const { schemaId, symbolId, onYes, onNo } = props;

  const maps = useAppSelector((state) => selectAllMaps(state));

  const { data: canDeleteCheck } = useCheckCanDeleteSymbolQuery({
    schemaId,
    symbolId,
  });

  const onDelete = (symbolId: number) => () => onYes(symbolId);

  return (
    <React.Fragment>
      {canDeleteCheck?.deletable === true && (
        <Dialog open={true} onClose={onNo} fullWidth>
          <DialogTitle>Delete symbol?</DialogTitle>
          <DialogActions>
            <Button onClick={onNo}>No</Button>
            <Button onClick={onDelete(symbolId)}>Yes</Button>
          </DialogActions>
        </Dialog>
      )}

      {canDeleteCheck?.deletable === false && (
        <Dialog open={true} onClose={onNo}>
          <DialogTitle>Symbol in use</DialogTitle>
          <DialogContent>
            To delete this symbol, please remove it from the features on these
            maps first.
            <List dense>
              {canDeleteCheck.count_by_map.map(({ map_id, count }) => {
                const map = maps.find((m) => m.id === map_id);
                return (
                  <ListItem key={map_id}>
                    <ListItemText
                      primary={map?.name || "Unknown map"}
                      secondary={`Used by ${count} feature(s)`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={onNo}>OK</Button>
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
}

export default SchemaSymbolDeleteManager;
