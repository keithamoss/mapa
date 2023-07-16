// https://css-tricks.com/converting-color-spaces-in-javascript/
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

	// #FF0 (default to opacity=1 aka 255)
	if (h.length == 4) {
		r = '0x' + h[1] + h[1];
		g = '0x' + h[2] + h[2];
		b = '0x' + h[3] + h[3];
		// #FFF0
	} else if (h.length === 5) {
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

export function RGBACSSDarkenColour(rgba: string, darken_by_percentage: number) {
	const rgbaNumeric = rgba
		.replace('rgba(', '')
		.replace(')', '')
		.replace(/\s/g, '')
		.split(',')
		.map((s) => Number(s));

	return RGBAToHSLA(rgbaNumeric[0], rgbaNumeric[1], rgbaNumeric[2], rgbaNumeric[3], darken_by_percentage);
}

export function RGBAToHSLA(r: number, g: number, b: number, a: number, darken_by_percentage: number) {
	// Make r, g, and b fractions of 1
	r /= 255;
	g /= 255;
	b /= 255;

	// Find greatest and smallest channel values
	const cmin = Math.min(r, g, b),
		cmax = Math.max(r, g, b),
		delta = cmax - cmin;

	let h = 0,
		s = 0,
		l = 0;

	// Calculate hue
	// No difference
	if (delta == 0) h = 0;
	// Red is max
	else if (cmax == r) h = ((g - b) / delta) % 6;
	// Green is max
	else if (cmax == g) h = (b - r) / delta + 2;
	// Blue is max
	else h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	// Make negative hues positive behind 360°
	if (h < 0) h += 360;

	// Calculate lightness
	l = (cmax + cmin) / 2;

	// Calculate saturation
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	// Multiply l and s by 100
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return HSLAToRGBA(h, s, l - darken_by_percentage, a);
}

export function HSLAToRGBA(h: number, s: number, l: number, a: number) {
	// Must be fractions of 1
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
		m = l - c / 2;

	let r = 0,
		g = 0,
		b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}
