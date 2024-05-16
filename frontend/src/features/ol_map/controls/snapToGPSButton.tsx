import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import { Avatar, IconButton, styled } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey } from '../../../app/ui/theme';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(2),
	right: theme.spacing(2),
}));

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
		<StyledIconButton onClick={handleClick} size="small">
			<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
				{isFollowingGPS === true ? <GpsFixedIcon /> : <GpsOffIcon />}
			</Avatar>
		</StyledIconButton>
	);
}

export default memo(SnapToGPSButton);
