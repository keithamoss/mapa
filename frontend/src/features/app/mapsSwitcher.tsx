import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { SpeedDialIcon, styled, useTheme } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial, { type CloseReason } from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { useUpdateUserProfileMutation } from '../../app/services/auth';
import { selectAllMaps } from '../maps/mapsSlice';
import {
	defaultMapHeroIcon,
	defaultMapHeroIconColour,
	defaultMapHeroIconOpacity,
	defaultSymbolSizeForSpeedDials,
	getFontAwesomeIconForSymbolPreview,
} from '../symbology/symbologyHelpers';
import {
	defaultSearchParameters,
	eMapFeaturesLoadingStatus,
	selectActiveMap,
	setFilteredFeatures,
	setMapFeaturesStatus,
	setSearchParameters,
} from './appSlice';

const StyledSpeedDial = styled(SpeedDial)(() => ({
	// Ensures that the SVG icons inside <Link /> elements display centred inside their wee circles
	'& svg': {
		display: 'block',
	},
}));

interface Props {
	onSpeedDialOpen: () => void;
	onSpeedDialClose: () => void;
}

export default function MapSwitcher(props: Props) {
	const { onSpeedDialOpen, onSpeedDialClose } = props;

	const dispatch = useAppDispatch();

	const theme = useTheme();

	const activeMap = useAppSelector(selectActiveMap);

	const maps = useAppSelector(selectAllMaps);
	const mapsWithHeroIcons = maps.filter((m) => m.hero_icon !== null && m.id !== activeMap?.id).reverse();

	const hasMapsWithNoHeroIcons = maps.find((m) => m.hero_icon === null) !== undefined;

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
		onSpeedDialOpen();
	};

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

	const [updateUserProfile] = useUpdateUserProfileMutation();

	const onSwitchMap = (mapId: number) => () => {
		dispatch(setMapFeaturesStatus(eMapFeaturesLoadingStatus.LOADING));

		setOpen(false);

		dispatch(setSearchParameters(defaultSearchParameters));
		dispatch(setFilteredFeatures([]));
		updateUserProfile({ last_map_id: mapId });

		onSpeedDialClose();
	};

	if (mapsWithHeroIcons.length === 0 && maps.length < 2) {
		return null;
	}

	return (
		<React.Fragment>
			{/* Ensure our Backdrop sits just above the other on-map controls in App.tsx and olMap.tsx */}
			<Backdrop open={open} onClick={handleBackdropClick} sx={{ zIndex: theme.zIndex.speedDial + 2 }} />

			<StyledSpeedDial
				ariaLabel="A button to switch the active map"
				icon={
					<SpeedDialIcon
						icon={
							activeMap !== undefined && activeMap.hero_icon !== null
								? getFontAwesomeIconForSymbolPreview(activeMap.hero_icon, {
										size: defaultSymbolSizeForSpeedDials,
									})
								: /* Just in case the user is on a map with no hero icon, we still want to let them use thes switcher */ getFontAwesomeIconForSymbolPreview(
										{
											icon: defaultMapHeroIcon,
											colour: defaultMapHeroIconColour,
											opacity: defaultMapHeroIconOpacity,
											size: defaultSymbolSizeForSpeedDials,
										},
									)
						}
					/>
				}
				onClose={handleClose}
				onOpen={handleOpen}
				open={open}
				// pointerEvents is required here because we're using our custom <img> as the icon, not a regular <svg>
				// Without this the <img> triggers an event which means the first tap on the button opens and then immediately closes the FAB
				sx={{
					position: 'relative', // Ensure the primary FAB button sits below the Backdrop in SpeedDialNavigation (without this it's position static and ignores z-indexes)
					zIndex: theme.zIndex.speedDial + 3, // Ensure the buttons in the SpeedDial sit just above our Backdrop from above
					'& .MuiButtonBase-root': {
						zIndex: theme.zIndex.speedDial + 3, // Ensure the buttons in the SpeedDial sit just above our Backdrop from above
						bgcolor: 'white',
					},
					'& img': { pointerEvents: 'none' },
				}}
			>
				{mapsWithHeroIcons.map((map) => (
					<SpeedDialAction
						key={map.name}
						title={map.name}
						tooltipTitle={map.name}
						// tooltipPlacement="right"
						// tooltipOpen
						icon={
							map.hero_icon !== null
								? getFontAwesomeIconForSymbolPreview(map.hero_icon, {
										size: defaultSymbolSizeForSpeedDials,
									})
								: undefined /* This won't actually happen - these maps always have hero icons */
						}
						onClick={onSwitchMap(map.id)}
					/>
				))}

				{hasMapsWithNoHeroIcons === true && (
					<SpeedDialAction
						title="More ..."
						tooltipTitle="More ..."
						icon={
							<Link to="/MapManager">
								<MoreHorizIcon />
							</Link>
						}
					/>
				)}
			</StyledSpeedDial>
		</React.Fragment>
	);
}