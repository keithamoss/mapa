import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { SpeedDialIcon, styled } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial, { CloseReason } from '@mui/material/SpeedDial';
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

export default function MapSwitcher() {
	const dispatch = useAppDispatch();

	const activeMap = useAppSelector(selectActiveMap);

	const maps = useAppSelector(selectAllMaps);
	const mapsWithHeroIcons = maps.filter((m) => m.hero_icon !== null && m.id !== activeMap?.id).reverse();

	const hasMapsWithNoHeroIcons = maps.find((m) => m.hero_icon === null) !== undefined;

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = (event: React.SyntheticEvent<{}, Event>, reason: CloseReason) => {
		// Stops the SpeedDial from closing when the mouse leaves the FAB on desktop
		if (reason !== 'mouseLeave') {
			setOpen(false);
		}
	};

	const handleBackdropClick = () => {
		setOpen(false);
	};

	const [updateUserProfile] = useUpdateUserProfileMutation();

	const onSwitchMap = (mapId: number) => () => {
		dispatch(setMapFeaturesStatus(eMapFeaturesLoadingStatus.LOADING));

		setOpen(false);

		dispatch(setSearchParameters(defaultSearchParameters));
		dispatch(setFilteredFeatures([]));
		updateUserProfile({ last_map_id: mapId });
	};

	if (mapsWithHeroIcons.length === 0) {
		return null;
	}

	return (
		<React.Fragment>
			<Backdrop open={open} onClick={handleBackdropClick} />

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
				sx={{ '& .MuiButtonBase-root': { bgcolor: 'white' }, '& img': { pointerEvents: 'none' } }}
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
