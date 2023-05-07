import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

interface Props {
  onNo: () => void;
  onYes: () => void;
}

export default function DiscardChangesDialog(props: Props) {
  console.log("### DiscardChangesDialog ###");

  const { onNo, onYes } = props;

  return (
    <Dialog open={true} onClose={onNo}>
      <DialogTitle>Discard unsaved changes?</DialogTitle>
      <DialogActions>
        <Button onClick={onNo}>No</Button>
        <Button onClick={onYes}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}
