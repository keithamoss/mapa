import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import { Avatar, IconButton, styled } from '@mui/material';
import { memo } from 'react';
import { mapaThemeMapButtonControlGrey } from '../../../app/ui/theme';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(8),
	right: theme.spacing(2),
}));

interface Props {
	isFollowingHeading: boolean;
	onFollowHeadingEnabled: () => void;
	onFollowHeadingDisabled: () => void;
}

function FollowHeadingButton(props: Props) {
	const { isFollowingHeading, onFollowHeadingEnabled, onFollowHeadingDisabled } = props;

	const handleClick = () => {
		if (isFollowingHeading === true) {
			onFollowHeadingDisabled();
		} else if (isFollowingHeading === false) {
			onFollowHeadingEnabled();
		}
	};

	return (
		<StyledIconButton onClick={handleClick} size="small">
			<Avatar sx={{ bgcolor: mapaThemeMapButtonControlGrey }}>
				{isFollowingHeading === true ? <ExploreIcon /> : <ExploreOffOutlinedIcon />}
			</Avatar>
		</StyledIconButton>
	);
}

export default memo(FollowHeadingButton);
