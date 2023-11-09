import { Schema } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, SpeedDialIcon, styled } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { mapaThemeWarningPurple } from '../../app/ui/theme';
import { getCountOfFilteredFeatureIds } from './appSlice';

const StyledAvatar = styled(Avatar)(() => ({
	position: 'absolute',
	top: '-12px',
	right: '-6px',
}));

const StyledSpeedDial = styled(SpeedDial)(() => ({
	// Ensures that the SVG icons inside <Link /> elements display centred inside their wee circles
	'& svg': {
		display: 'block',
	},
}));

const actions = [
	{
		icon: (
			<Link to="/MapManager">
				<MapIcon color="primary" />
			</Link>
		),
		name: 'Maps',
	},
	{
		icon: (
			<Link to="/SchemaManager">
				<Schema color="primary" />
			</Link>
		),
		name: 'Schemas',
	},
	{
		icon: (
			<Link to="/SearchManager">
				<SearchIcon color="primary" />
			</Link>
		),
		name: 'Search',
	},
	{
		icon: (
			<Link to="/SettingsManager">
				<SettingsIcon color="primary" />
			</Link>
		),
		name: 'Settings',
	},
	{
		icon: (
			<Link to="/About">
				<InfoIcon color="primary" />
			</Link>
		),
		name: 'About Mapa',
	},
];

export default function SpeedDialNavigation() {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
	};

	const onActionClick = () => {
		setOpen(false);
	};

	const searchResultCount = useAppSelector(getCountOfFilteredFeatureIds);

	return (
		<React.Fragment>
			<Backdrop open={open} />

			<StyledSpeedDial
				ariaLabel="The primary navigation element for the app"
				icon={
					searchResultCount >= 1 ? (
						<div>
							<StyledAvatar sx={{ bgcolor: mapaThemeWarningPurple, width: 26, height: 26 }}>
								<FilterAltIcon fontSize="small" />
							</StyledAvatar>
							<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />
						</div>
					) : (
						<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />
					)
				}
				onClose={handleClose}
				onOpen={handleOpen}
				open={open}
			>
				{actions.map((action) => (
					<SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={onActionClick} />
				))}
			</StyledSpeedDial>
		</React.Fragment>
	);
}
