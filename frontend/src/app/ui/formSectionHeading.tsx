import { FormLabel } from '@mui/material';
import { mapaThemeSecondaryBlue } from './theme';

interface Props {
	children: React.ReactNode;
	marginBottom?: number;
}

export default function FormSectionHeading(props: Props) {
	const { children, marginBottom } = props;

	return (
		<FormLabel
			component="legend"
			sx={{ fontWeight: 500, color: mapaThemeSecondaryBlue, mb: marginBottom !== undefined ? marginBottom : 1 }}
		>
			{children}
		</FormLabel>
	);
}
