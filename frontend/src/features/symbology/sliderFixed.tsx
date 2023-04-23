import styled from "@emotion/styled";
import { Slider, SliderProps } from "@mui/material";
import { forwardRef, useEffect } from "react";

// c.f. https://stackoverflow.com/questions/64776560/scroll-events-unintentionally-changing-material-ui-slider-values
// c.f. https://github.com/mui/material-ui/issues/20990

const StyledSlider = styled(Slider)`
  touch-action: auto;
`;

function SliderFixed(props: SliderProps, ref: any) {
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener(
        "touchstart",
        (e: any) => {
          const isThumb = e.target.dataset.index;

          if (!isThumb) {
            e.stopPropagation();
          }
        },
        { capture: true }
      );
    }
  });

  return <StyledSlider ref={ref} {...props} />;
}

export default forwardRef(SliderFixed);
