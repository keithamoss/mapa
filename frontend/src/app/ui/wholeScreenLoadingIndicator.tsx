import { Backdrop, CircularProgress } from '@mui/material';

interface Props {
	zIndex?: number;
}

export const WholeScreenLoadingIndicator = (props: Props) => (
	<Backdrop
		sx={{ zIndex: (theme) => (props.zIndex !== undefined ? props.zIndex : theme.zIndex.drawer + 1) }}
		open={true}
	>
		{/* This colour is `mapaThemeSecondaryBlue`, it's just tweaked a little so it's still the same colour when the semi-transparent black backdrop alters its perceived colour.' */}
		<CircularProgress sx={{ color: '#113449' }} />
	</Backdrop>
);
