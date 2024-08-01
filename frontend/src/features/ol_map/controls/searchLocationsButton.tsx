import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Avatar, IconButton } from '@mui/material';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { mapaThemeMapButtonControlGrey, mapaThemeWarningPurple } from '../../../app/ui/theme';

interface Props {
	active: boolean;
}

function SearchLocationsButton(props: Props) {
	const { active } = props;

	return (
		<Link to="/SearchLocationsManager">
			<IconButton size="small">
				<Avatar
					sx={{
						bgcolor: active === true ? mapaThemeWarningPurple : mapaThemeMapButtonControlGrey,
					}}
				>
					<TravelExploreIcon />
				</Avatar>
			</IconButton>
		</Link>
	);
}

export default memo(SearchLocationsButton);
