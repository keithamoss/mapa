import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import { Avatar, Box, IconButton } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey, mapaThemeSecondaryBlue } from '../../../app/ui/theme';

interface Props {
	isFeatureMovementAllowed: boolean;
	onFeatureMovementEnabled: () => void;
	onFeatureMovementDisabled: () => void;
	isStickyModeOn: boolean;
	onFeatureMovementStickyModeEnabled: () => void;
	onFeatureMovementStickyModeDisabled: () => void;
}

function FeatureMovementButton(props: Props) {
	const {
		isFeatureMovementAllowed,
		onFeatureMovementEnabled,
		onFeatureMovementDisabled,
		isStickyModeOn,
		onFeatureMovementStickyModeEnabled,
		onFeatureMovementStickyModeDisabled,
	} = props;

	const onClickFeatureMovement = () => {
		if (isFeatureMovementAllowed === true) {
			onFeatureMovementDisabled();
		} else {
			onFeatureMovementEnabled();
		}
	};

	const onClickFeatureMovementStickyMode = () => {
		if (isStickyModeOn === true) {
			onFeatureMovementStickyModeDisabled();
		} else {
			onFeatureMovementStickyModeEnabled();
		}
	};

	return (
		<Box sx={{ display: 'inline-flex', float: 'right' }}>
			{isFeatureMovementAllowed === true && (
				<IconButton onClick={onClickFeatureMovementStickyMode} size="small">
					{isStickyModeOn === true ? (
						<Avatar
							sx={{
								bgcolor: mapaThemeSecondaryBlue,
							}}
						>
							<RepeatOnIcon />
						</Avatar>
					) : (
						<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
							<RepeatIcon />
						</Avatar>
					)}
				</IconButton>
			)}

			<IconButton onClick={onClickFeatureMovement} size="small">
				{isFeatureMovementAllowed === true ? (
					<Avatar
						sx={{
							bgcolor: mapaThemeSecondaryBlue,
						}}
					>
						<LockOpenIcon />
					</Avatar>
				) : (
					<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
						<LockIcon />
					</Avatar>
				)}
			</IconButton>
		</Box>
	);
}

export default memo(FeatureMovementButton);
