/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import styled from '@emotion/styled';
import { Slider, SliderProps } from '@mui/material';
import { forwardRef, useEffect } from 'react';

// MUI issue tracking this:
// https://github.com/mui/material-ui/issues/20990

// Ionic has/had the same issue:
// https://github.com/ionic-team/ionic-framework/issues/19004

// c.f. https://stackoverflow.com/questions/64776560/scroll-events-unintentionally-changing-material-ui-slider-values
// Original touch-action idea via
// Source: https://stackoverflow.com/a/69273037
// Updated pointer-events idea via
// Soruce: https://forum.bubble.io/t/prevent-interaction-with-slider-inputs-when-scrolling-on-mobile/149542/2

// tl;dr This seems to work pretty well with limited compromises
// This restricts slider adjustment to only when the slider is moved via the thumb, rather than single clicking on the track.

// eslint-disable-next-line @typescript-eslint/naming-convention
const StyledSlider = styled(Slider)`
	/* touch-action: none; */
	pointer-events: none;

	& .MuiSlider-thumb {
		/* touch-action: auto; */
		pointer-events: auto;
	}
`;

function SliderFixed(props: SliderProps, ref: any) {
	useEffect(() => {
		if (ref.current) {
			ref.current.addEventListener(
				'touchstart',
				(e: any) => {
					const isThumb = e.target.dataset.index;

					if (!isThumb) {
						e.stopPropagation();
					}
				},
				{ capture: true },
			);
		}
	});

	return <StyledSlider ref={ref} {...props} />;
}

// This works, but the trade-off is that you can't drag the slider normally any more
// Source: https://stackoverflow.com/a/69236201
// function SliderFixed2(props: SliderProps, ref: any) {
//   const delta = 50;
//   const sliderRef = useRef<any>(null);
//   const [value, setValue] = useState(props.value); // Or from some prop
//   const [touchStart, setTouchStart] = useState(0);

//   const debouncedHandler = useMemo(() => {
//     // Using lodash.debounce
//     return debounce((evt, value) => {
//       // If it is a mouse event then just update value as usual
//       if (evt instanceof MouseEvent) {
//         setValue(value);
//       }
//     }, 25);
//   }, []);

//   useLayoutEffect(() => {
//     // console.log("useLayoutEffect", sliderRef.current);
//     if (sliderRef.current) {
//       //   console.log("useLayoutEffect addEventListener");
//       sliderRef.current.addEventListener("touchstart", (evt: any) => {
//         console.log("> setTouchStart", evt.changedTouches[0].pageY);
//         setTouchStart(evt.changedTouches[0].pageY);
//       });
//     }
//   }, []);

//   return (
//     <Slider
//       {...props}
//       value={value}
//       ref={sliderRef}
//       onChange={debouncedHandler}
//       onChangeCommitted={(evt, value) => {
//         if (typeof value === "number") {
//           if (evt instanceof TouchEvent) {
//             console.log("TouchEvent");
//             console.log("touchStart", touchStart);
//             console.log("pageY", evt.changedTouches[0].pageY);
//             console.log(
//               "calc 1",
//               Math.abs(touchStart - evt.changedTouches[0].pageY)
//             );
//             console.log(
//               "calc final",
//               Math.abs(touchStart - evt.changedTouches[0].pageY) < delta
//             );
//             if (Math.abs(touchStart - evt.changedTouches[0].pageY) < delta) {
//               console.log("setValue", value);
//               setValue(value);
//             }
//           } else {
//             setValue(value);
//           }
//         }
//       }}
//     />
//   );
// }

export default forwardRef(SliderFixed);
