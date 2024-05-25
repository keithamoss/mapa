import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Avatar, IconButton } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey, mapaThemeWarningPurple } from '../../../app/ui/theme';

interface Props {
	isFeatureMovementAllowed: boolean;
	onFeatureMovementEnabled: () => void;
	onFeatureMovementDisabled: () => void;
}

function FeatureMovementButton(props: Props) {
	const { isFeatureMovementAllowed, onFeatureMovementEnabled, onFeatureMovementDisabled } = props;

	const handleClick = () => {
		if (isFeatureMovementAllowed === true) {
			onFeatureMovementDisabled();
		} else if (isFeatureMovementAllowed === false) {
			onFeatureMovementEnabled();
		}
	};

	return (
		<IconButton onClick={handleClick} size="small">
			{isFeatureMovementAllowed === true ? (
				<Avatar
					sx={{
						bgcolor: mapaThemeWarningPurple,
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
	);
}

export default memo(FeatureMovementButton);
