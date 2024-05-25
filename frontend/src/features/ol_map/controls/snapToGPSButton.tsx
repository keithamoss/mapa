import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import { Avatar, IconButton } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey } from '../../../app/ui/theme';

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
			<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
				{isFollowingGPS === true ? <GpsFixedIcon /> : <GpsOffIcon />}
			</Avatar>
		</IconButton>
	);
}

export default memo(SnapToGPSButton);
