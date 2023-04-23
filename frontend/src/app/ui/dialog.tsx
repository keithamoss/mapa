import { Dialog, DialogProps, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  onClose?: () => void;
  children: React.ReactNode;
  dialogProps?: Partial<DialogProps>;
  transitionProps?: Partial<TransitionProps>;
}

export const DialogWithTransition = ({
  onClose,
  children,
  dialogProps,
  transitionProps,
}: Props) => {
  return (
    <Dialog
      fullScreen
      open={true}
      onClose={onClose}
      TransitionComponent={Transition}
      TransitionProps={transitionProps}
      {...dialogProps}
    >
      {children}
    </Dialog>
  );
};
