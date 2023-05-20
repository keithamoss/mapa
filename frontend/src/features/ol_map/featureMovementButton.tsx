import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Avatar, IconButton, styled } from '@mui/material';
import { blue } from '@mui/material/colors';
import { memo } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
const StyledIconButton = styled(IconButton)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(8),
	right: theme.spacing(2),
}));

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
		<StyledIconButton onClick={handleClick} size="small">
			{isFeatureMovementAllowed === true ? (
				<Avatar
					sx={{
						bgcolor: blue[400],
					}}
				>
					<LockOpenIcon />
				</Avatar>
			) : (
				<Avatar>
					<LockIcon />
				</Avatar>
			)}
		</StyledIconButton>
	);
}

export default memo(FeatureMovementButton);
