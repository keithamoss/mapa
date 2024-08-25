import { Backdrop, CircularProgress } from '@mui/material';

export const WholeScreenLoadingIndicator = () => (
	<Backdrop sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }} open={true}>
		{/* This colour is `mapaThemeSecondaryBlue`, it's just tweaked a little so it's still the same colour when the semi-transparent black backdrop alters its perceived colour.' */}
		<CircularProgress sx={{ color: '#113449' }} />
	</Backdrop>
);
