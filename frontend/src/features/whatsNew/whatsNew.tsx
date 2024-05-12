import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';
import {
	AppBar,
	Box,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { useUpdateWhatsNewViewCountMutation } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import { mapaThemeSecondaryBlue, mapaThemeSecondaryBlueGrey } from '../../app/ui/theme';
import { titleCase } from '../../app/utils';
import { selectUser } from '../auth/authSlice';
import whatsNewJSON from './whatsNew.json';

function WhatsNewPage() {
	const navigate = useNavigate();

	const [updateWhatsNewViewCount] = useUpdateWhatsNewViewCountMutation();

	const user = useAppSelector(selectUser);

	useEffect(() => {
		if (user?.whats_new_release_count !== whatsNewJSON.length) {
			updateWhatsNewViewCount(whatsNewJSON.length);
		}
	}, [updateWhatsNewViewCount, user?.whats_new_release_count]);

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
							What&apos;s New
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					{whatsNewJSON.map((release, key) => (
						<Box key={key} sx={{ mb: 4 }}>
							<Typography
								sx={{ color: mapaThemeSecondaryBlueGrey, fontWeight: 500, mb: 2 }}
								variant="h5"
								component="div"
							>
								{release.version || <em>Unnamed Version</em>}
							</Typography>

							{typeof release.date === 'string' && release.date.length > 0 && (
								<Typography sx={{ mb: 1, fontStyle: 'italic' }} variant="body2" component="div">
									{release.date}
								</Typography>
							)}

							{typeof release.summary === 'string' && release.summary.length > 0 && (
								<Typography sx={{ mb: 1 }} variant="body2" component="div">
									{release.summary}
								</Typography>
							)}

							{release.changes !== undefined &&
								Object.keys(release.changes).length > 0 &&
								Object.entries(release.changes).map(([fieldName, fieldValue]) => (
									<React.Fragment key={fieldName}>
										<List disablePadding sx={{ mb: 1 }}>
											<ListSubheader
												component="div"
												id="nested-list-subheader"
												sx={{ pl: 0, lineHeight: '24px', color: mapaThemeSecondaryBlue }}
											>
												{titleCase(fieldName)}
											</ListSubheader>

											{Array.isArray(fieldValue) === true && (
												<List disablePadding sx={{ '& li:first-of-type': { pt: 0 } }}>
													{fieldValue.map((whatChanged, key) => (
														<ListItem key={key} sx={{ pb: 0, alignItems: 'start' }}>
															<ListItemIcon sx={{ minWidth: 16, marginTop: 0.5 }}>
																<CircleIcon sx={{ width: 8, color: mapaThemeSecondaryBlueGrey }} />
															</ListItemIcon>

															<ListItemText
																primary={
																	Array.isArray(whatChanged) === true ? (
																		<React.Fragment>
																			<b>{whatChanged[0]}:</b> {whatChanged[1]}
																		</React.Fragment>
																	) : (
																		whatChanged
																	)
																}
																sx={{
																	'& .MuiTypography-root': {
																		fontSize: '0.875rem',
																	},
																}}
															></ListItemText>
														</ListItem>
													))}
												</List>
											)}
										</List>
									</React.Fragment>
								))}
						</Box>
					))}
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default WhatsNewPage;
