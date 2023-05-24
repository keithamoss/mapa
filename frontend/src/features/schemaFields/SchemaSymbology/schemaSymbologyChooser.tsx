import CloseIcon from '@mui/icons-material/Close';
import {
	Avatar,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	ListSubheader,
	Paper,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { groupBy, sortBy } from 'lodash-es';
import React from 'react';
import {
	FeatureSchema,
	FeatureSchemaSymbology,
	FeatureSchemaSymbologySymbolsValue,
} from '../../../app/services/schemas';
import { DialogWithTransition } from '../../../app/ui/dialog';
import { defaultNakedDialogColour } from '../../../app/ui/theme';
import {
	defaultSymbologyGroupId,
	defaultSymbolSizeForFormFields,
	getFontAwesomeIconForSymbolPreview,
	getSymbolGroups,
	getSymbologyGroupById,
} from '../../symbology/symbologyHelpers';

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
) => (
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
			<ListItemText primary={option.symbol.props.name} />
		</ListItemButton>
	</ListItem>
);

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

	return (
		<React.Fragment>
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

								{optionsGrouped.Favourites.map((option) => createSymbolListItem(option, onClickSymbol))}
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

								{optionsGrouped['Most recently added'].map((option) => createSymbolListItem(option, onClickSymbol))}
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

										{optionsGrouped[symbologyGroup.name].map((option) => createSymbolListItem(option, onClickSymbol))}
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
