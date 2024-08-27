import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
	Alert,
	AlertTitle,
	AppBar,
	Button,
	CircularProgress,
	FormControl,
	FormGroup,
	FormHelperText,
	IconButton,
	InputAdornment,
	List,
	ListItem,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useCallback, useEffect, useRef } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { searchLocationsFormValidationSchema } from '../../app/forms/searchLocationsForm';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { useFetchMapboxGeocodingResultsQuery } from '../../app/services/mapbox';
import { DialogWithTransition } from '../../app/ui/dialog';
import TextFieldWithPasteAdornment from '../../app/ui/textFieldWithPasteAdornment';
import {
	SearchLocationsParameters,
	defaultSearchLocationsParameters,
	getSearchLocationsParameters,
	setSearchLocationsParameters,
	setSearchLocationsZoomToCoordinates,
} from '../app/appSlice';
import {
	IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
	getMapboxAPIKey,
	isSearchingYet,
} from './searchLocationsHelpers';

function SearchLocationsManager() {
	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const searchParameters = useAppSelector(getSearchLocationsParameters);

	// ######################
	// Form Component
	// ######################
	const {
		watch,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm<SearchLocationsParameters>({
		resolver: yupResolver(searchLocationsFormValidationSchema),
		defaultValues: searchParameters,
	});

	const { search_term } = watch();

	const onDoneWithForm: SubmitHandler<SearchLocationsParameters> = () => {};

	useEffect(() => {
		if (isSearchingYet(search_term) === true) {
			dispatch(setSearchLocationsParameters({ search_term }));
		}
	}, [dispatch, search_term]);
	// ######################
	// Form Component (End)
	// ######################

	// ######################
	// TextField Component
	// ######################
	const textInput = useRef<HTMLInputElement>(null);

	const onPasteFromClipboard = (pastedText: string) => {
		setValue('search_term', pastedText, { shouldDirty: true });
	};
	// ######################
	// TextField Component (End)
	// ######################

	// ######################
	// Mapbox Search Query
	// ######################
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${search_term}.json?limit=10&proximity=&types=${defaultMapboxSearchTypes.join(
		'%2C',
	)}&access_token=${getMapboxAPIKey()}`;

	const {
		data: mapboxSearchResults,
		error: errorFetchingMapboxResults,
		isFetching: isFetchingMapboxResults,
		isSuccess: isSuccessFetchingMapboxResults,
	} = useFetchMapboxGeocodingResultsQuery(isSearchingYet(search_term) === true ? { url } : skipToken);

	const onChoose = useCallback(
		(feature: IMapboxGeocodingAPIResponseFeature) => () => {
			dispatch(setSearchLocationsParameters({ search_term }));
			dispatch(setSearchLocationsZoomToCoordinates(feature.geometry.coordinates));
			navigate('/');
		},
		[dispatch, navigate, search_term],
	);
	// ######################
	// Mapbox Search Query (End)
	// ######################

	// ######################
	// Header Controls
	// ######################
	const onClose = () => navigate('/');

	const onClearSearchResults = () => {
		reset(defaultSearchLocationsParameters);
		dispatch(setSearchLocationsParameters(defaultSearchLocationsParameters));

		if (textInput.current !== null) {
			textInput.current.focus();
		}
	};
	// ######################
	// Header Controls (End)
	// ######################

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose} disableRestoreFocus>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Location Search
						</Typography>
						<Button color="inherit" onClick={onClearSearchResults}>
							Clear
						</Button>
					</Toolbar>
				</AppBar>

				<form onSubmit={handleSubmit(onDoneWithForm)}>
					<Paper elevation={0} sx={{ m: 3 }}>
						<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="search_term"
									control={control}
									render={({ field }) => (
										<TextFieldWithPasteAdornment
											{...field}
											inputRef={textInput}
											label="Search"
											autoFocus
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														{isFetchingMapboxResults === true ? <CircularProgress size={24} /> : <SearchIcon />}
													</InputAdornment>
												),
											}}
											onPasteFromClipboard={onPasteFromClipboard}
										/>
									)}
								/>
							</FormGroup>

							{errors.search_term && <FormHelperText error>{errors.search_term.message}</FormHelperText>}
						</FormControl>

						{/* Handles not found and all other types of error */}
						{errorFetchingMapboxResults !== undefined && (
							<Alert severity="error">
								<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
								Something went awry when we tried to search for that place.
							</Alert>
						)}

						{isFetchingMapboxResults === false &&
							isSuccessFetchingMapboxResults === true &&
							mapboxSearchResults !== undefined && (
								<List sx={{ pt: 0 }}>
									{mapboxSearchResults === null && (
										<ListItem>
											<ListItemText primary="An error occurred"></ListItemText>
										</ListItem>
									)}

									{typeof mapboxSearchResults === 'object' &&
										mapboxSearchResults !== null &&
										mapboxSearchResults.features.length === 0 && (
											<ListItem>
												<ListItemText primary="No results found"></ListItemText>
											</ListItem>
										)}

									{isSearchingYet(search_term) === true &&
										typeof mapboxSearchResults === 'object' &&
										mapboxSearchResults !== null &&
										mapboxSearchResults.features.length > 0 &&
										mapboxSearchResults.features.map((feature) => {
											const [place_name_first_part, ...place_name_rest] = feature.place_name.split(', ');
											const matches = match(place_name_first_part, search_term, {
												insideWords: true,
											});
											const parts = parse(place_name_first_part, matches);

											return (
												<ListItem key={feature.id} onClick={onChoose(feature)} sx={{ cursor: 'pointer' }}>
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
														secondary={place_name_rest.join(', ')}
													></ListItemText>
												</ListItem>
											);
										})}
								</List>
							)}
					</Paper>
				</form>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SearchLocationsManager;
