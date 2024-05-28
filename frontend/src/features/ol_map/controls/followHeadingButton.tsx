import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import { Avatar, IconButton } from '@mui/material';
import { memo, useCallback } from 'react';
import { mapaThemeMapButtonControlGrey, mapaThemeSecondaryBlue, mapaThemeWarningPurple } from '../../../app/ui/theme';
import { MapHeadingStatus } from '../olMapDeviceOrientationHelpers';

const getIcon = (status: MapHeadingStatus) => {
	switch (status) {
		case MapHeadingStatus.Off:
			return (
				<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
					<ExploreOffOutlinedIcon />
				</Avatar>
			);
		case MapHeadingStatus.On:
			return (
				<Avatar sx={{ bgcolor: mapaThemeSecondaryBlue }}>
					<CompassCalibrationIcon />
				</Avatar>
			);
		case MapHeadingStatus.OnAndMapFollowing:
			return (
				<Avatar sx={{ bgcolor: mapaThemeSecondaryBlue }}>
					<ExploreIcon />
				</Avatar>
			);
		case MapHeadingStatus.Denied:
			return (
				<Avatar sx={{ bgcolor: mapaThemeWarningPurple }}>
					<ExploreOffOutlinedIcon />
				</Avatar>
			);
		default:
			return null;
	}
};

interface Props {
	status: MapHeadingStatus;
	onFollowHeadingOn: () => void;
	onFollowHeadingOnAndMapFollowing: () => void;
	onFollowHeadingOff: () => void;
	onFollowHeadingDenied: () => void;
}

function FollowHeadingButton(props: Props) {
	const { status, onFollowHeadingOn, onFollowHeadingOnAndMapFollowing, onFollowHeadingOff, onFollowHeadingDenied } =
		props;

	const onClickButton = useCallback(() => {
		switch (status) {
			case MapHeadingStatus.Off:
				onFollowHeadingOn();
				break;
			case MapHeadingStatus.On:
				onFollowHeadingOnAndMapFollowing();
				break;
			case MapHeadingStatus.OnAndMapFollowing:
				onFollowHeadingOff();
				break;
			case MapHeadingStatus.Denied:
				onFollowHeadingDenied();
				break;
			default:
				onFollowHeadingOff();
		}
	}, [onFollowHeadingDenied, onFollowHeadingOff, onFollowHeadingOn, onFollowHeadingOnAndMapFollowing, status]);

	if (status === MapHeadingStatus.Unsupported) {
		return null;
	}

	return (
		<IconButton onClick={onClickButton} size="small">
			{getIcon(status)}
		</IconButton>
	);
}

export default memo(FollowHeadingButton);
