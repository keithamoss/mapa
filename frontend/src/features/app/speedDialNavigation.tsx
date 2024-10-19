import { Schema } from '@mui/icons-material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, SpeedDialIcon, styled } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial, { type CloseReason } from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { mapaThemeWarningPurple } from '../../app/ui/theme';
import { selectUser } from '../auth/authSlice';
import whatsNewJSON from '../whatsNew/whatsNew.json';
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
		linkTo: '/MapManager',
		icon: <MapIcon color="primary" />,
		name: 'Maps',
	},
	{
		linkTo: '/SchemaManager',
		icon: <Schema color="primary" />,
		name: 'Schemas',
	},
	{
		linkTo: '/SearchFeaturesManager',
		icon: <SearchIcon color="primary" />,
		name: 'Search',
	},
	{
		linkTo: '/SettingsManager',
		icon: <SettingsIcon color="primary" />,
		name: 'Settings',
	},
	{
		linkTo: '/WhatsNew',
		icon: <NewReleasesIcon color="primary" />,
		name: "What's New",
	},
	{
		linkTo: '/About',
		icon: <InfoIcon color="primary" />,
		name: 'About Mapa',
	},
	{
		linkTo: '/DebugManager',
		icon: <BugReportIcon color="primary" />,
		name: 'Debug',
	},
];

interface Props {
	onSpeedDialOpen: () => void;
	onSpeedDialClose: () => void;
}

export default function SpeedDialNavigation(props: Props) {
	const { onSpeedDialOpen, onSpeedDialClose } = props;

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
		onSpeedDialOpen();
	};

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	const handleClose = (event: React.SyntheticEvent<{}, Event>, reason: CloseReason) => {
		// Stops the SpeedDial from closing when the mouse leaves the FAB on desktop
		if (reason !== 'mouseLeave') {
			setOpen(false);
			onSpeedDialClose();
		}
	};

	const handleBackdropClick = () => {
		setOpen(false);
		onSpeedDialClose();
	};

	const onActionClick = () => {
		setOpen(false);
		onSpeedDialClose();
	};

	const highlightSearchFilter = useAppSelector(getCountOfFilteredFeatureIds) >= 1;
	const highlightWhatsNew = whatsNewJSON.length > (useAppSelector(selectUser)?.whats_new_release_count || 0);

	return (
		<React.Fragment>
			<Backdrop open={open} onClick={handleBackdropClick} />

			<StyledSpeedDial
				ariaLabel="The primary navigation element for the app"
				icon={
					highlightSearchFilter ? (
						<React.Fragment>
							<StyledAvatar sx={{ bgcolor: mapaThemeWarningPurple, width: 26, height: 26 }}>
								<FilterAltIcon sx={{ fontSize: '1.1rem' }} />
							</StyledAvatar>
							<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />
						</React.Fragment>
					) : highlightWhatsNew ? (
						<React.Fragment>
							<StyledAvatar sx={{ bgcolor: mapaThemeWarningPurple, width: 26, height: 26 }}>
								<NewReleasesIcon sx={{ fontSize: '1.1rem' }} />
							</StyledAvatar>
							<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />
						</React.Fragment>
					) : (
						<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />
					)
				}
				onClose={handleClose}
				onOpen={handleOpen}
				open={open}
			>
				{actions.map((action) => {
					const highlightIcon = !!(
						(highlightSearchFilter && action.name === 'Search') ||
						(highlightWhatsNew && action.name === "What's New")
					);

					return (
						<SpeedDialAction
							key={action.name}
							icon={
								<Link to={action.linkTo}>
									{React.cloneElement(action.icon, { sx: highlightIcon === true ? { color: 'white' } : {} })}
								</Link>
							}
							tooltipTitle={action.name}
							onClick={onActionClick}
							sx={highlightIcon === true ? { backgroundColor: mapaThemeWarningPurple } : {}}
						/>
					);
				})}
			</StyledSpeedDial>
		</React.Fragment>
	);
}
