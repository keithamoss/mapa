import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
	AppBar,
	Box,
	Button,
	Checkbox,
	Chip,
	FormControl,
	FormGroup,
	FormHelperText,
	FormLabel,
	IconButton,
	InputAdornment,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Paper,
	Select,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import NotFound from '../../NotFound';
import { searchFormValidationSchema } from '../../app/forms/searchForm';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { MapaFeature } from '../../app/services/features';
import { DialogWithTransition } from '../../app/ui/dialog';
import {
	SearchField,
	SearchFieldLabel,
	SearchParameters,
	defaultSearchParameters,
	getSearchParameters,
	selectActiveMapId,
	setFilteredFeatures,
	setSearchParameters,
} from '../app/appSlice';
import { selectAllFeatures } from '../features/featuresSlice';
import { selectAllFeatureSchemas } from '../schemas/schemasSlice';
import { isSearchingYet, searchFeatures } from './searchFeaturesHelpers';

function SearchFeaturesManagerEntrypoint() {
	const mapId = useAppSelector(selectActiveMapId);

	if (mapId === undefined) {
		return <NotFound />;
	}

	return <SearchFeaturesManagerEntrypointLayer2 mapId={mapId} />;
}

function SearchFeaturesManagerEntrypointLayer2(props: { mapId: number }) {
	const features = useAppSelector(selectAllFeatures);

	return <SearchFeaturesManager mapId={props.mapId} features={features} />;
}

interface Props {
	mapId: number;
	features: MapaFeature[];
}

function SearchFeaturesManager(props: Props) {
	const {
		// mapId,
		features,
	} = props;

	const schemas = useAppSelector(selectAllFeatureSchemas);

	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const searchParameters = useAppSelector(getSearchParameters);

	const {
		watch,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<SearchParameters>({
		resolver: yupResolver(searchFormValidationSchema),
		defaultValues: searchParameters,
	});

	const { search_term, search_fields } = watch();

	const searchResults = searchFeatures(features, schemas, search_term, search_fields);

	const onDoneWithForm: SubmitHandler<SearchParameters> = () => {};

	const onClose = () => navigate('/');

	const onClearSearchResults = () => {
		reset(defaultSearchParameters);
		dispatch(setSearchParameters(defaultSearchParameters));
		dispatch(setFilteredFeatures([]));
	};

	const onGoToMap = () => {
		dispatch(setSearchParameters({ search_term, search_fields }));
		dispatch(setFilteredFeatures(searchResults.map((result) => result.id)));
		navigate('/');
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
							Search Features
						</Typography>
						<Button color="inherit" onClick={onClearSearchResults}>
							Clear
						</Button>
						<Button color="inherit" onClick={onGoToMap}>
							Go To Map
						</Button>
					</Toolbar>
				</AppBar>

				<form onSubmit={handleSubmit(onDoneWithForm)}>
					<Paper elevation={0} sx={{ m: 3 }}>
						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="search_term"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Search"
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<SearchIcon />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</FormGroup>

							{errors.search_term && <FormHelperText error>{errors.search_term.message}</FormHelperText>}
						</FormControl>

						<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
							<FormGroup>
								<InputLabel>Fields to search</InputLabel>

								<Controller
									name="search_fields"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											multiple
											input={<OutlinedInput label="Fields to search" />}
											renderValue={(selected) => (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{Object.values(SearchField)
														.filter((searchFieldType) => selected.includes(searchFieldType) === true)
														.map((searchFieldType) => (
															<Chip key={searchFieldType} label={SearchFieldLabel[searchFieldType]} />
														))}
												</Box>
											)}
										>
											{Object.values(SearchField).map((searchFieldType) => (
												<MenuItem key={searchFieldType} value={searchFieldType}>
													<Checkbox checked={search_fields.includes(searchFieldType) === true} />
													<ListItemText primary={SearchFieldLabel[searchFieldType]} />
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormGroup>

							{errors.search_fields && <FormHelperText error>{errors.search_fields.message}</FormHelperText>}
						</FormControl>

						{isSearchingYet(search_term) === true && (
							<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
								<FormLabel component="legend">Search results ({searchResults.length})</FormLabel>

								<FormGroup>
									{searchResults.length === 0 && isSearchingYet(search_term) === true && (
										<Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1 }}>
											No results found.
										</Typography>
									)}

									<List>
										{searchResults.map((result) => (
											<ListItem key={result.id}>
												<ListItemText primary={result.terms.join(', ')} secondary={`#${result.id}`}></ListItemText>
											</ListItem>
										))}
									</List>
								</FormGroup>

								{errors.search_fields && <FormHelperText error>{errors.search_fields.message}</FormHelperText>}
							</FormControl>
						)}
					</Paper>
				</form>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SearchFeaturesManagerEntrypoint;
