import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Button, FormControl, FormLabel, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getAPIBaseURL, getBaseURL, isCacheApiSupported } from '../../app/utils';
import { iconsLibraryCacheName } from '../symbology/iconsLibraryCache';
import { getAllResourcesFromCache, purgeAllCaches } from '../symbology/iconsLibraryCacheHelpers';

function DebugManager() {
	const navigate = useNavigate();

	const onClose = () => navigate('/');

	const [cacheEntries, setCacheEntries] = useState<(Response | undefined)[]>();

	useEffect(() => {
		async function fetchResources() {
			setCacheEntries(await getAllResourcesFromCache(iconsLibraryCacheName));
		}
		fetchResources();
	}, []);

	const purgeCache = async () => {
		if (isCacheApiSupported() === true) {
			await purgeAllCaches();

			setCacheEntries(await getAllResourcesFromCache(iconsLibraryCacheName));
		}
	};

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Debug
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					<FormControl sx={{ mb: 3 }} fullWidth>
						<FormLabel>Icons library cache</FormLabel>
						Cache API Supported: {isCacheApiSupported() === true ? 'Yes' : 'No'}
						<br />
						{isCacheApiSupported() === true && (
							<React.Fragment>
								<Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={purgeCache}>
									Purge Cache
								</Button>
								Cache Entries:{' '}
								{cacheEntries !== undefined
									? cacheEntries.length > 0
										? cacheEntries.map((entry, idx) =>
												entry !== undefined ? (
													<div key={idx} style={{ marginBottom: '15px' }}>
														{entry.status}
														<br />
														{entry.url.replace(getBaseURL(), '')}
													</div>
												) : undefined,
											)
										: 'Nil'
									: 'Unknown'}
							</React.Fragment>
						)}
					</FormControl>

					<FormControl sx={{ mb: 3 }} fullWidth>
						<FormLabel>Version debugging</FormLabel>

						<Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => window.location.reload()}>
							Reload
						</Button>

						{performance
							.getEntriesByType('resource')
							// .filter((e) => e.initiatorType === 'script')
							.filter((e) => e.name.includes(getBaseURL()) === true || e.name.includes(getAPIBaseURL()) === true)
							.map((e: any, idx) => {
								// console.log(e);
								return (
									<div key={idx} style={{ marginBottom: '15px' }}>
										{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
										{e.initiatorType}
										<br />
										{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
										{e.entryType}
										<br />
										{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
										{e.deliveryType !== '' && (
											<React.Fragment>
												{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
												{e.deliveryType}
												<br />
											</React.Fragment>
										)}
										{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
										{e.name}
									</div>
								);
							})}
					</FormControl>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default DebugManager;
