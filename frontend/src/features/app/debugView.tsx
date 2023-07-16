import CloseIcon from '@mui/icons-material/Close';
import {
	AppBar,
	Avatar,
	FormControl,
	FormGroup,
	IconButton,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Toolbar,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { DialogWithTransition } from '../../app/ui/dialog';
import { selectUser } from '../auth/authSlice';
import { getAvailableStylesForIcon, getIconsForCategory, searchIcons } from '../symbology/iconsLibrary';
import { getFontAwesomeIconFromLibraryAsSVGImage } from '../symbology/symbologyHelpers';

function DebugView() {
	const user = useAppSelector(selectUser);

	const navigate = useNavigate();

	const onClose = () => navigate('/');

	if (user === null) {
		return null;
	}

	return (
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

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<FormGroup>
					{searchIcons('zzzz').map((iconSearchResult) => (
						<ListItem key={iconSearchResult.name} disablePadding>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										sx={{
											bgcolor: grey[50],
											width: '105px',
											height: '105px',
											'& > img': { width: 85, height: 85 },
										}}
									>
										{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={iconSearchResult.label} secondary={iconSearchResult.name}></ListItemText>
							</ListItemButton>
						</ListItem>
					))}

					{getIconsForCategory('vegetables-(coloured)').map((iconSearchResult) => (
						<ListItem key={iconSearchResult.name} disablePadding>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										sx={{
											bgcolor: grey[50],
											width: '105px',
											height: '105px',
											'& > img': { width: 85, height: 85 },
										}}
									>
										{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
									</Avatar>
								</ListItemAvatar>

								{getAvailableStylesForIcon(iconSearchResult.name)
									.reverse()
									.filter((styleName) => ['coloured'].includes(styleName) === false)
									.map((styleName) => (
										<ListItemAvatar key={styleName}>
											<Avatar
												sx={{
													bgcolor: grey[50],
													width: '105px',
													height: '105px',
													'& > img': { width: 85, height: 85 },
												}}
											>
												{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name, styleName)}
											</Avatar>
										</ListItemAvatar>
									))}
								<ListItemText primary={iconSearchResult.label} secondary={iconSearchResult.name}></ListItemText>
							</ListItemButton>
						</ListItem>
					))}
				</FormGroup>
			</FormControl>
		</DialogWithTransition>
	);
}

export default DebugView;
