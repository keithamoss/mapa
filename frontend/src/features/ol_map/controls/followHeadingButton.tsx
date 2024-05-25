import CompassCalibrationTwoToneIcon from '@mui/icons-material/CompassCalibrationTwoTone';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import { Avatar, IconButton } from '@mui/material';
import { memo, useCallback } from 'react';
import { mapaThemeMapButtonControlGrey, mapaThemeWarningPurple } from '../../../app/ui/theme';
import { MapHeadingStatus } from '../olMapDeviceOrientationHelpers';

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
			<Avatar
				sx={{ bgcolor: status === MapHeadingStatus.Denied ? mapaThemeWarningPurple : mapaThemeMapButtonControlGrey }}
			>
				{status === MapHeadingStatus.On ? (
					<CompassCalibrationTwoToneIcon />
				) : status === MapHeadingStatus.OnAndMapFollowing ? (
					<ExploreIcon />
				) : (
					<ExploreOffOutlinedIcon />
				)}
			</Avatar>
		</IconButton>
	);
}

export default memo(FollowHeadingButton);
