import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import { Avatar, IconButton } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey, mapaThemeSecondaryBlue } from '../../../app/ui/theme';

interface Props {
	isFollowingGPS: boolean;
	onFollowGPSEnabled: () => void;
	onFollowGPSDisabled: () => void;
}

function SnapToGPSButton(props: Props) {
	const { isFollowingGPS, onFollowGPSEnabled, onFollowGPSDisabled } = props;

	const handleClick = () => {
		if (isFollowingGPS === true) {
			onFollowGPSDisabled();
		} else if (isFollowingGPS === false) {
			onFollowGPSEnabled();
		}
	};

	return (
		<IconButton onClick={handleClick} size="small">
			{isFollowingGPS === true ? (
				<Avatar sx={{ bgcolor: mapaThemeSecondaryBlue }}>
					<GpsFixedIcon />
				</Avatar>
			) : (
				<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
					<GpsOffIcon />
				</Avatar>
			)}
		</IconButton>
	);
}

export default memo(SnapToGPSButton);
