import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogWithTransition } from '../../app/ui/dialog';
import FormSectionHeading from '../../app/ui/formSectionHeading';

function AboutPage() {
	const navigate = useNavigate();

	const onClose = () => navigate('/');

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							About Mapa
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					<Box sx={{ mb: 3 }}>
						<Typography variant="body1" sx={{ mb: 1 }}>
							For H, with ❤️
						</Typography>
					</Box>

					<Box sx={{ mb: 3 }}>
						<FormSectionHeading>The Map</FormSectionHeading>

						<Typography variant="body1" sx={{ mb: 1 }}>
							For the map, many many thanks for the amazing team behind the{' '}
							<a href="https://openlayers.org/">OpenLayers</a>, the interactive web mapping library par excellence.
						</Typography>

						<Typography variant="body1" sx={{ mb: 1 }}>
							For the basemap, an equally massive thanks to everyone who contributes to{' '}
							<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> - and to the folks at{' '}
							<a href="https://www.mapbox.com/map-feedback/">Mapbox</a> who make it a breeze to design and publish
							customised basemaps from OpenStreetMap.
						</Typography>
					</Box>

					<Box sx={{ mb: 3 }}>
						<FormSectionHeading>The Icons</FormSectionHeading>

						<Typography variant="body1" sx={{ mb: 1 }}>
							For the majority of our icons, a big shout out to the folks at{' '}
							<a href="https://fontawesome.com/">Font Awesome</a> for the single most beautifully designed library of
							icons on the planet.
						</Typography>

						<Typography variant="body1" sx={{ mb: 1 }}>
							For our coloured icons of fruits, vegetables, and the like thanks are owed to{' '}
							<a href="https://www.flaticon.com/">Flaticon</a> and the wonderful community of creators who publish icons
							there.
						</Typography>

						<Typography variant="body1" sx={{ mb: 1 }}>
							For specific credits, check out{' '}
							<a href="https://github.com/keithamoss/mapa/blob/main/frontend/src/features/symbology/flaticon/icons/working-space/PACKS.md">
								PACKS.md
							</a>{' '}
							in our GitHub repository.
						</Typography>
					</Box>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default AboutPage;
