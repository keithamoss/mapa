import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';

import CloseIcon from '@mui/icons-material/Close';

import {
	Avatar,
	Button,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	OutlinedInput,
	Paper,
	Typography,
} from '@mui/material';

import React, { startTransition, useRef, useState } from 'react';
import { IconStyle, getCategories } from './iconsLibrary';
import { getFontAwesomeIconFromLibraryAsSVGImage } from './symbologyHelpers';

import { grey } from '@mui/material/colors';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { DialogWithTransition } from '../../app/ui/dialog';
import { defaultNakedDialogColour } from '../../app/ui/theme';
import { isSearchingYet } from '../search/searchHelpers';
import {
	getCategoryLabelByName,
	getDefaultStyleByIconName,
	getIconsForCategory,
	searchIcons,
} from './iconsLibraryHelpers';
import SymbologyIconStyleChooser from './symbologyIconStyleChooser';

interface Props {
	boostCircularModifierIcons?: boolean;
	onChoose: (icon: string, icon_style: IconStyle) => void;
	onClose: () => void;
}

function SymbologyIconChooser(props: Props) {
	const { boostCircularModifierIcons, onChoose, onClose } = props;

	// ######################
	// Icon Searching
	// ######################
	const [iconSearchTerm, setIconSearchTerm] = useState('');

	const onIconSearchInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		startTransition(() => {
			if (isSearchingYet(event.target.value) === true) {
				setIconSearchTerm(event.target.value);
			} else if (event.target.value.length === 0) {
				setIconSearchTerm('');
			}
		});
	};

	const textInput = useRef<HTMLInputElement>(null);

	const onClearIconSearchInput = () => {
		if (textInput.current !== null) {
			textInput.current.value = '';
			setIconSearchTerm('');
		}
	};
	// ######################
	// Icon Searching (End)
	// ######################

	// ######################
	// Icon Categories
	// ######################
	const [chosenIconCategory, setChosenIconCategory] = useState<string | undefined>(undefined);

	const onChooseIconCategory = (categoryName: string) => () => {
		setChosenIconCategory(categoryName);
	};

	const onChooseNavigateToAllCategories = () => setChosenIconCategory(undefined);
	// ######################
	// Icon Categories (End)
	// ######################

	// ######################
	// Icon Choosing
	// ######################
	const [iconName, setIconName] = useState<string | undefined>(undefined);

	const onChooseIcon = (name: string) => () => {
		setIconName(name);
		setIsIconStyleChooserOpen(true);
	};
	// ######################
	// Icon Choosing (End)
	// ######################

	// ######################
	// Icon Style Choosing
	// ######################
	const [isIconStyleChooserOpen, setIsIconStyleChooserOpen] = useState(false);

	const onChooseIconStyle = (icon_style: IconStyle) => {
		if (iconName !== undefined) {
			setChosenIconCategory(undefined);
			setIconSearchTerm('');
			setIconName(undefined);

			onChoose(iconName, icon_style);
		}
	};

	const onCloseIconStyleChooser = () => setIsIconStyleChooserOpen(false);
	// ######################
	// Icon Style Choosing (End)
	// ######################

	const iconSearchResults =
		iconSearchTerm !== '' ? searchIcons(iconSearchTerm, chosenIconCategory, boostCircularModifierIcons) : [];

	return (
		<React.Fragment>
			{isIconStyleChooserOpen === true && iconName !== undefined && (
				<SymbologyIconStyleChooser
					selectedIcon={iconName}
					onChoose={onChooseIconStyle}
					onClose={onCloseIconStyleChooser}
				/>
			)}

			<DialogWithTransition themeColour={defaultNakedDialogColour}>
				<DialogTitle>
					<IconButton
						onClick={onClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<Paper
					elevation={0}
					sx={{
						m: 3,
					}}
				>
					{/* 
          ############################################
          Icon search bar
          ############################################
          */}
					<FormControl variant="outlined" fullWidth>
						<InputLabel>
							{chosenIconCategory === undefined
								? 'Search for an icon'
								: `Search for an icon in ${getCategoryLabelByName(chosenIconCategory) || 'Unknown'}`}
						</InputLabel>
						<OutlinedInput
							inputRef={textInput}
							label={
								chosenIconCategory === undefined
									? 'Search for an icon'
									: `Search for an icon in ${getCategoryLabelByName(chosenIconCategory) || 'Unknown'}`
							}
							onChange={onIconSearchInputChange}
							endAdornment={
								iconSearchTerm.length > 0 ? (
									<ClearIcon sx={{ color: grey[500] }} onClick={onClearIconSearchInput} />
								) : null
							}
							sx={{ mb: 1 }}
						/>
					</FormControl>

					{/* 
          ############################################
          Display the icon search results
          ############################################
          */}
					{iconSearchTerm !== '' && (
						<List
							sx={{
								width: '100%',
								maxWidth: 360,
								bgcolor: 'background.paper',
							}}
						>
							{iconSearchResults.length === 0 && iconSearchTerm !== '' && (
								<Typography variant="caption" sx={{ fontStyle: 'italic' }}>
									No icons found.
								</Typography>
							)}

							{iconSearchResults.map((iconSearchResult) => {
								const matches = match(iconSearchResult.label, iconSearchTerm, {
									insideWords: true,
								});
								const parts = parse(iconSearchResult.label, matches);

								return (
									<ListItem key={iconSearchResult.name} disablePadding>
										<ListItemButton onClick={onChooseIcon(iconSearchResult.name)}>
											<ListItemAvatar>
												<Avatar
													sx={{
														bgcolor: grey[50],
														width: '45px',
														height: '45px',
														'& > img': { width: 25, height: 25 },
													}}
												>
													{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<span>
														{parts.map((part, index) => (
															<span
																key={index}
																style={{
																	fontWeight: part.highlight ? 700 : 400,
																}}
															>
																{part.text}
															</span>
														))}
													</span>
												}
											></ListItemText>
										</ListItemButton>
									</ListItem>
								);
							})}
						</List>
					)}

					{/* 
          ############################################
          Display the available icon categories
          ############################################
          */}
					{chosenIconCategory === undefined && iconSearchTerm === '' && (
						<List
							sx={{
								width: '100%',
								maxWidth: 360,
								bgcolor: 'background.paper',
							}}
						>
							{Object.values(getCategories()).map((category) => (
								<ListItem key={category.name} disablePadding>
									<ListItemButton onClick={onChooseIconCategory(category.name)}>
										<ListItemAvatar>
											<Avatar
												sx={{
													bgcolor: grey[50],
													width: '45px',
													height: '45px',
													'& > img': { width: 25, height: 25 },
												}}
											>
												{getFontAwesomeIconFromLibraryAsSVGImage(
													category.hero_icon,
													getDefaultStyleByIconName(category.hero_icon),
												)}
											</Avatar>
										</ListItemAvatar>
										<ListItemText primary={category.label} />
									</ListItemButton>
								</ListItem>
							))}
						</List>
					)}

					{/* 
          ############################################
          Display the icons within your chosen category
          ############################################
          */}
					{chosenIconCategory !== undefined && iconSearchTerm === '' && (
						<React.Fragment>
							{/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
							<Grid container direction="column" sx={{ mt: 1 }}>
								<Grid container direction="row" alignItems="center">
									<Grid item sx={{ flexGrow: 1 }}>
										<Typography variant="h6">{getCategoryLabelByName(chosenIconCategory)}</Typography>
									</Grid>
									<Grid item>
										<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onChooseNavigateToAllCategories}>
											Back
										</Button>
									</Grid>
								</Grid>
							</Grid>

							<List
								sx={{
									width: '100%',
									maxWidth: 360,
									bgcolor: 'background.paper',
									contentVisibility: 'auto',
								}}
							>
								{getIconsForCategory(chosenIconCategory).map((icon) => (
									<ListItem key={icon.name} disablePadding>
										<ListItemButton onClick={onChooseIcon(icon.name)}>
											<ListItemAvatar>
												<Avatar
													sx={{
														bgcolor: grey[50],
														width: '45px',
														height: '45px',
														'& > img': { width: 25, height: 25 },
													}}
												>
													{getFontAwesomeIconFromLibraryAsSVGImage(icon.name)}
												</Avatar>
											</ListItemAvatar>
											<ListItemText primary={icon.label} /*secondary={icon.name}*/ />
										</ListItemButton>
									</ListItem>
								))}
							</List>
						</React.Fragment>
					)}
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SymbologyIconChooser;
