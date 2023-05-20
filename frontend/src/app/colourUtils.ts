// https://css-tricks.com/converting-color-spaces-in-javascript/
// https://stackoverflow.com/a/5624139
// export const hexToRGB = (hex: string) => {
//   // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
//   var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
//   hex = hex.replace(shorthandRegex, function (m, r, g, b) {
//     return r + r + g + g + b + b;
//   });

//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16),
//       }
//     : null;
// };

// export const hexToRGBCSS = (
//   hex: string | undefined,
//   default_colour = "rgba(0, 0, 0, 0.01)"
// ) => {
//   if (hex === undefined) {
//     return default_colour;
//   }
//   const rgb = hexToRGB(hex);
//   return rgb !== null ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : default_colour;
// };

export const hextoRGBACSS = (
	h: string | undefined,
	opacity_override?: number,
	default_colour = 'rgba(0, 0, 0, 0.01)',
) => {
	if (h === undefined) {
		return default_colour;
	}

	let r: number | string = 0,
		g: number | string = 0,
		b: number | string = 0,
		a: number | string = (opacity_override || 1) * 255;

	// #FFF0
	if (h.length === 5) {
		r = '0x' + h[1] + h[1];
		g = '0x' + h[2] + h[2];
		b = '0x' + h[3] + h[3];
		a = '0x' + h[4] + h[4];
		// #FFFFFF (default to opacity=1 aka 255)
	} else if (h.length === 7) {
		r = '0x' + h[1] + h[2];
		g = '0x' + h[3] + h[4];
		b = '0x' + h[5] + h[6];
		// #FFFFFF00
	} else if (h.length === 9) {
		r = '0x' + h[1] + h[2];
		g = '0x' + h[3] + h[4];
		b = '0x' + h[5] + h[6];
		a = '0x' + h[7] + h[8];
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	a = +((a as any) / 255).toFixed(3);

	return `rgba(${+r}, ${+g}, ${+b}, ${a})`;
};
