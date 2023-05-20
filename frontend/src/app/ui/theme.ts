import { createTheme } from '@mui/material';

export const defaultAppMapColour = '#f7f7f7';

export const defaultAppBarColour = '#1876d2';

export const defaultNakedDialogColour = '#FFFFFF';

export const defaultNakedNonFullScreenDialogColour = '#083d70';

export const demSausagePurple = '#6740b4';

export const theme = createTheme({
	palette: {
		// primary: {
		//   main: purple[500],
		// },
		secondary: {
			main: demSausagePurple,
		},
	},
});

export const getThemeColour = () => {
	const el = document.querySelector("meta[name='theme-color']");
	return el?.getAttribute('content') || defaultAppMapColour;
};

export const setThemeColour = (themeColour: string) => {
	const el = document.querySelector("meta[name='theme-color']");
	if (el !== null) {
		el.setAttribute('content', themeColour);
	}
};
