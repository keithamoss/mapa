import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
	AppBar,
	Avatar,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	ListSubheader,
	OutlinedInput,
	Paper,
	Toolbar,
	styled,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { groupBy, sortBy } from 'lodash-es';
import React, { startTransition, useState } from 'react';
import {
	FeatureSchema,
	FeatureSchemaSymbology,
	FeatureSchemaSymbologySymbolsValue,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';
import { defaultNakedDialogColour } from '../../../app/ui/theme';
import { SymbolSearchResult, isSearchingYet, searchSymbols } from '../../search/searchHelpers';
import {
	defaultSymbolSizeForFormFields,
	defaultSymbologyGroupId,
	getFontAwesomeIconForSymbolPreview,
	getSymbolGroups,
	getSymbologyGroupById,
} from '../../symbology/symbologyHelpers';

const StyledOutlinedInput = styled(OutlinedInput)(({ theme }) => ({
	width: '90%',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 1),
	},
}));

interface SymbologyAutocompleteOption {
	symbol: FeatureSchemaSymbologySymbolsValue;
	option_group: string;
}

const getSymbolOptions = (mapId: number, schema: FeatureSchema, symbology: FeatureSchemaSymbology) => {
	const favouritedSymbols = symbology.symbols
		.filter((symbol) => symbol.favourited_map_ids.includes(mapId))
		.map((symbol) => ({ symbol, option_group: 'Favourites' }));

	const mostRecentlyAdded =
		schema.recently_used_symbols[mapId] !== undefined
			? schema.recently_used_symbols[mapId]
					.map((symbolId) => {
						const symbol = symbology.symbols.find((symbol) => symbol.id === symbolId);

						return symbol !== undefined
							? {
									symbol,
									option_group: 'Most recently added',
							  }
							: undefined;
					})
					// Ref: https://www.benmvp.com/blog/filtering-undefined-elements-from-array-typescript/
					.filter((symbol): symbol is SymbologyAutocompleteOption => !!symbol)
			: [];

	const availableSymbols = sortBy([...symbology.symbols], (i) => i.group_id).map((symbol) => ({
		symbol,
		option_group: getSymbologyGroupById(symbol.group_id, symbology)?.name || '',
	}));

	return groupBy([...favouritedSymbols, ...mostRecentlyAdded, ...availableSymbols], 'option_group');
};

const createSymbolListItem = (
	option: SymbologyAutocompleteOption,
	onClickSymbol: (symbol: FeatureSchemaSymbologySymbolsValue) => () => void,
	symbolSearchTerm: string,
	symbolSearchResults: SymbolSearchResult[],
) => {
	const symbolName =
		symbolSearchResults.find((s) => s.id === option.symbol.id)?.['prop.name'] || option.symbol.props.name || '';
	const matches = match(symbolName, symbolSearchTerm, {
		insideWords: true,
	});
	const parts = parse(symbolName, matches);

	return (
		<ListItem key={`${option.symbol.group_id}-${option.symbol.id}`} disablePadding>
			<ListItemButton onClick={onClickSymbol(option.symbol)}>
				<ListItemAvatar>
					<Avatar
						sx={{
							bgcolor: grey[50],
							width: '45px',
							height: '45px',
							'& > img': { width: 25, height: 25 },
						}}
					>
						{getFontAwesomeIconForSymbolPreview(option.symbol.props, {
							size: defaultSymbolSizeForFormFields,
						})}
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
				/>
			</ListItemButton>
		</ListItem>
	);
};

interface Props {
	mapId: number;
	schema: FeatureSchema;
	symbology: FeatureSchemaSymbology;
	onChoose: (symbol: FeatureSchemaSymbologySymbolsValue | null) => void;
	onClose: () => void;
}

function SchemaSymbologyChooser(props: Props) {
	const { mapId, schema, symbology, onChoose, onClose } = props;

	const optionsGrouped = getSymbolOptions(mapId, schema, symbology);

	const onClickSymbol = (symbol: FeatureSchemaSymbologySymbolsValue) => () => onChoose(symbol);

	// ######################
	// Symbol Searching
	// ######################
	const [symbolSearchTerm, setSymbolSearchTerm] = useState('');

	const onSymbolSearchInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		startTransition(() => {
			if (isSearchingYet(event.target.value) === true) {
				setSymbolSearchTerm(event.target.value);
			} else if (event.target.value.length === 0) {
				setSymbolSearchTerm('');
			}
		});
	};
	// ######################
	// Symbol Searching (End)
	// ######################

	const symbolSearchResults = symbolSearchTerm !== '' ? searchSymbols(schema.symbology, symbolSearchTerm) : [];
	const symbolSearchResultsSymbolIds = symbolSearchResults.map((s) => s.id);

	return (
		<React.Fragment>
			<DialogWithTransition themeColour={defaultNakedDialogColour}>
				<AppBar color="transparent" elevation={0} sx={{ position: 'sticky' }}>
					<Toolbar>
						<div style={{ width: '100%' }}>
							<StyledOutlinedInput
								placeholder="Search for a symbol"
								onChange={onSymbolSearchInputChange}
								startAdornment={<SearchIcon sx={{ color: grey[500] }} />}
							/>
						</div>

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
					</Toolbar>
				</AppBar>

				<Paper
					elevation={0}
					sx={{
						m: 3,
						mt: 0,
					}}
				>
					<List
						sx={{
							width: '100%',
							maxWidth: 360,
							bgcolor: 'background.paper',
						}}
					>
						{optionsGrouped.Favourites !== undefined && (
							<React.Fragment>
								<ListSubheader sx={{ mt: 0 }} color="primary" disableGutters>
									Favourites
								</ListSubheader>

								{optionsGrouped.Favourites.filter((o) =>
									symbolSearchTerm !== '' ? symbolSearchResultsSymbolIds.includes(o.symbol.id) : true,
								).map((option) => createSymbolListItem(option, onClickSymbol, symbolSearchTerm, symbolSearchResults))}
							</React.Fragment>
						)}

						{optionsGrouped['Most recently added'] !== undefined && (
							<React.Fragment>
								<ListSubheader
									sx={{
										mt: optionsGrouped.Favourites !== undefined ? 2 : 0,
									}}
									color="primary"
									disableGutters
								>
									Most recently added
								</ListSubheader>

								{optionsGrouped['Most recently added']
									.filter((o) => (symbolSearchTerm !== '' ? symbolSearchResultsSymbolIds.includes(o.symbol.id) : true))
									.map((option) => createSymbolListItem(option, onClickSymbol, symbolSearchTerm, symbolSearchResults))}
							</React.Fragment>
						)}

						{getSymbolGroups(symbology).map((symbologyGroup) => (
							<React.Fragment key={symbologyGroup.id}>
								{optionsGrouped[symbologyGroup.name] !== undefined && (
									<React.Fragment key={symbologyGroup.id}>
										<ListSubheader
											sx={{
												mt:
													(optionsGrouped.Favourites !== undefined ||
														optionsGrouped['Most recently added'] !== undefined) &&
													symbologyGroup.id === defaultSymbologyGroupId
														? 2
														: 0,
											}}
											color="primary"
											disableGutters
										>
											{symbologyGroup.name}
										</ListSubheader>

										{optionsGrouped[symbologyGroup.name]
											.filter((o) =>
												symbolSearchTerm !== '' ? symbolSearchResultsSymbolIds.includes(o.symbol.id) : true,
											)
											.map((option) =>
												createSymbolListItem(option, onClickSymbol, symbolSearchTerm, symbolSearchResults),
											)}
									</React.Fragment>
								)}
							</React.Fragment>
						))}
					</List>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SchemaSymbologyChooser;
