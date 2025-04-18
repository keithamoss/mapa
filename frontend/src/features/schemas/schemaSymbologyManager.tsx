import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MediationIcon from '@mui/icons-material/Mediation';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
import {
	Alert,
	AppBar,
	Box,
	Button,
	ButtonGroup,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	MenuItem,
	Snackbar,
	Toolbar,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { groupBy, isEqual } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import {
	FeatureSchemaSymbology,
	FeatureSchemaSymbologyGroup,
	FeatureSchemaSymbologySymbolsValue,
	SymbologyProps,
} from '../../app/services/schemas';
import { StyledMenu } from '../../app/ui/styledMenu';
import SymbologyFieldEditor from '../symbology/symbologyFieldEditor';
import {
	defaultSymbolSizeForFormFields,
	defaultSymbologyGroupId,
	getFontAwesomeIconForSymbolPreview,
	getSymbolGroups,
	getSymbologyGroupById,
} from '../symbology/symbologyHelpers';
import SchemaSymbolDeleteManager from './schemaSymbolDeleteManager';
import SchemaSymbologyGroupChooserForRerranging from './schemaSymbologyGroupChooserForRerranging';
import SchemaSymbologyGroupEditor from './schemaSymbologyGroupEditor';

interface Props {
	schemaId?: number;
	symbology: FeatureSchemaSymbology;
	mapId?: number;
	onAddGroup: (groupName: string) => number;
	onEditGroup: (groupId: number, groupName: string) => void;
	onDeleteGroup: (groupId: number) => void;
	onAddObject: (symbol: SymbologyProps, groupId: number, symbolIdToAddAfter?: number) => void;
	onEditObject: (symbol: FeatureSchemaSymbologySymbolsValue) => void;
	onDeleteObject: (symbolId: number) => void;
	onFavouriteSymbol: (symbolId: number) => void;
	onUnfavouriteSymbol: (symbolId: number) => void;
	onRearrangeSymbolsToGroup: (symbolIds: number[], groupId: number) => void;
}

function SchemaSymbologyManager(props: Props) {
	const {
		schemaId,
		symbology,
		mapId,
		onAddGroup,
		onEditGroup,
		onDeleteGroup,
		onAddObject,
		onEditObject,
		onDeleteObject,
		onFavouriteSymbol,
		onUnfavouriteSymbol,
		onRearrangeSymbolsToGroup,
	} = props;

	const navigate = useNavigate();

	const symbolsByGroup = groupBy(symbology.symbols, 'group_id');

	// ######################
	// Add Group
	// ######################
	const [isAddingGroup, setIsAddingGroup] = useState(false);

	const onAddNewGroup = () => {
		setIsAddingGroup(true);
	};

	const onDoneAddingGroup = (groupName: string) => {
		onAddGroup(groupName);
		setIsAddingGroup(false);
	};

	const onCancelAddingGroup = () => {
		setIsAddingGroup(false);
	};
	// ######################
	// Add Group (End)
	// ######################

	// ######################
	// Edit Group
	// ######################
	const [groupForEditing, setGroupForEditing] = useState<FeatureSchemaSymbologyGroup | null>(null);

	const onClickEditGroup = (groupId: number) => () => {
		setGroupForEditing(getSymbologyGroupById(groupId, symbology));
	};

	const onDoneEditingGroup = (groupName: string) => {
		if (groupForEditing !== null) {
			onEditGroup(groupForEditing.id, groupName);
			setGroupForEditing(null);
		}
	};

	const onCancelEditingGroup = () => {
		setGroupForEditing(null);
	};
	// ######################
	// Edit Group (End)
	// ######################

	// ######################
	// Delete Group
	// ######################
	const onClickDeleteGroup = (groupId: number) => () => {
		onDeleteGroup(groupId);
	};
	// ######################
	// Delete Group (End)
	// ######################

	// ######################
	// Rearrange Symbols
	// ######################
	const [isRearrangingSymbols, setIsRearrangingSymbols] = useState(false);

	const onRearrangeSymbols = () => {
		setIsRearrangingSymbols(true);
	};

	const onCancelRearrangingSymbols = () => {
		setIsRearrangingSymbols(false);
		setSymbolsToRearrange([]);
	};

	const [symbolsToRearrange, setSymbolsToRearrange] = useState<number[]>([]);

	const onClickAddSymbolToRearrange = (sybmolId: number) => () => {
		setSymbolsToRearrange([...symbolsToRearrange, sybmolId]);
	};

	const onClickRemoveSymbolFromRearrange = (sybmolId: number) => () => {
		setSymbolsToRearrange(symbolsToRearrange.filter((id) => id !== sybmolId));
	};

	const [isRearrangingSymbolsGroupChooserOpen, setIsRearrangingSymbolsGroupChooserOpen] = useState(false);

	const onOpenGroupChooserForSymbolRearrange = () => {
		if (symbolsToRearrange.length >= 1) {
			setIsRearrangingSymbolsGroupChooserOpen(true);
		}
	};

	const onDoneRearrangingSymbols = (groupId: number) => {
		onRearrangeSymbolsToGroup(symbolsToRearrange, groupId);
		setIsRearrangingSymbolsGroupChooserOpen(false);
		setIsRearrangingSymbols(false);
		setSymbolsToRearrange([]);
	};

	const onCancelChoosingGroupToRearrangeSymbolsTo = () => setIsRearrangingSymbolsGroupChooserOpen(false);
	// ######################
	// Rearrange Symbols (End)
	// ######################

	// ######################
	// Add Symbol
	// ######################
	const [isAddingSymbologyField, setIsAddingSymbologyField] = useState(false);

	const [groupIdForNewSymbologyField, setGroupIdForNewSymbologyField] = useState<number | undefined>();

	const onAddSymbologyField = (groupId: number) => () => {
		setGroupIdForNewSymbologyField(groupId);
		setIsAddingSymbologyField(true);
	};

	const onDoneAddingSymbol = (symbologyField: SymbologyProps, groupId: number) => {
		onAddObject(symbologyField, groupId);

		setGroupIdForNewSymbologyField(undefined);
		setIsAddingSymbologyField(false);
	};

	const onCancelAddingSymbol = () => {
		setGroupIdForNewSymbologyField(undefined);
		setIsAddingSymbologyField(false);
	};
	// ######################
	// Add Symbol (End)
	// ######################

	// ######################
	// Edit Symbol
	// ######################
	const [symbolFieldForEditor, setSymbolFieldForEditor] = useState<FeatureSchemaSymbologySymbolsValue | undefined>();

	const onEditSymbol = (symbol: FeatureSchemaSymbologySymbolsValue) => () => {
		setSymbolFieldForEditor(symbol);
		navigate(
			schemaId !== undefined ? `/SchemaManager/Edit/${schemaId}/${symbol.id}` : `/SchemaManager/Create/${symbol.id}`,
		);
	};

	const onCancelEditingSymbol = () => {
		setSymbolFieldForEditor(undefined);
		navigate(schemaId !== undefined ? `/SchemaManager/Edit/${schemaId}` : `/SchemaManager/Create`);
	};

	const onDoneEditingSymbol = (symbologyField: SymbologyProps, groupId: number) => {
		if (symbolFieldForEditor !== undefined) {
			const local_symbol: FeatureSchemaSymbologySymbolsValue = {
				...symbolFieldForEditor,
				props: symbologyField,
				group_id: groupId,
			};
			onEditObject(local_symbol);

			setSymbolFieldForEditor(undefined);
			navigate(schemaId !== undefined ? `/SchemaManager/Edit/${schemaId}` : `/SchemaManager/Create`);
		}
	};
	// ######################
	// Edit Symbol (End)
	// ######################

	// ######################
	// (Un)favourite Symbols
	// ######################
	const onClickFavouriteSymbol = (symbolId: number) => () => {
		if (Number.isNaN(symbolId) === false) {
			onFavouriteSymbol(symbolId);
		}
	};

	const onClickUnfavouriteSymbol = (symbolId: number) => () => {
		if (Number.isNaN(symbolId) === false) {
			onUnfavouriteSymbol(symbolId);
		}
	};
	// ######################
	// (Un)favourite Symbols (End)
	// ######################

	// ######################
	// Menu
	// ######################
	const [symbolIdForMenu, setFieldIdForMenu] = useState<number | null>(null);

	const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
	const isMenuOpen = Boolean(menuAnchorEl);

	const handleOpenMenuClick = (fieldId: number) => (event: React.MouseEvent<HTMLElement>) => {
		setFieldIdForMenu(fieldId);
		setMenuAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setFieldIdForMenu(null);
		setMenuAnchorEl(null);
	};
	// ######################
	// Menu (End)
	// ######################

	// ######################
	// Duplicate Symbol
	// ######################
	const onClickDuplicateSymbol = (symbolId: number) => () => {
		const symbol = symbology.symbols.find((s) => s.id === symbolId);

		if (schemaId !== undefined && symbol !== undefined) {
			onAddObject(
				{
					...symbol.props,
					name: `${symbol.props.name} (Copy ${new Date().toLocaleString('en-GB', {
						weekday: 'short',
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						second: 'numeric',
					})})`,
				},
				symbol.group_id,
				symbolId,
			);
			handleClose();
		}
	};
	// ######################
	// Duplicate Symbol (End)
	// ######################

	// ######################
	// Delete Symbol
	// ######################
	const [symbolIdToDelete, setSymbolIdToDelete] = useState<number | undefined>(undefined);

	const onClickDeleteSymbol = (symbolId: number) => () => {
		if (schemaId === undefined) {
			// Schema hasn't been created yet, so we're safe to delete w/o checking
			onDeleteObject(symbolId);
			setSymbolIdToDelete(undefined);
			handleClose();
		} else {
			// SchemaSymbolDeleteManager checks the backend for us first to see if we're safe to delete
			setSymbolIdToDelete(symbolId);
		}
	};

	const onDeleteSymbol = (symbolId: number) => {
		onDeleteObject(symbolId);
		setSymbolIdToDelete(undefined);
		handleClose();
	};

	const onCancelDeleteSymbol = () => setSymbolIdToDelete(undefined);
	// ######################
	// Delete Symbol (End)
	// ######################

	// ######################
	// URL Handling
	// ######################
	const params = useParams();
	const symbolId = getIntegerParamOrUndefined(params, 'symbolId');

	// Support navigating (using the back button) from the symbol icon editor component spawned here by
	// closing the symbol editor so we see the underlying schemaForm component that spwaned this.
	useEffect(() => {
		if (symbolId !== undefined) {
			const selectedSymbol = symbology.symbols.find((s) => s.id === symbolId);

			if (selectedSymbol === undefined) {
				navigate(schemaId !== undefined ? `/SchemaManager/Edit/${schemaId}` : `/SchemaManager/Create`, {
					replace: true,
				});
				setIsSnackbarOpen(true);
				setSnackbarMessage('Symbol not found - maybe it was deleted?');
			} else if (selectedSymbol !== undefined && isEqual(selectedSymbol, symbolFieldForEditor) === false) {
				navigate(schemaId !== undefined ? `/SchemaManager/Edit/${schemaId}` : `/SchemaManager/Create`, {
					replace: true,
				});
				setIsSnackbarOpen(true);
				setSnackbarMessage("Symbols in schemas can't be directly loaded on a fresh page");
			}

			// Clear the editable symbol object when the user navigates away (e.g. goes back to the parent SchemaForm that this component sits within)
		} else if (symbolFieldForEditor !== undefined) {
			setSymbolFieldForEditor(undefined);
		}
	}, [navigate, schemaId, symbolFieldForEditor, symbolId, symbology.symbols]);

	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState<string>();

	const handleSnackbarClose = () => {
		setIsSnackbarOpen(false);
		setSnackbarMessage(undefined);
	};
	// ######################
	// URL Handling (End)
	// ######################

	return (
		<React.Fragment>
			{schemaId !== undefined && symbolIdToDelete !== undefined && (
				<SchemaSymbolDeleteManager
					schemaId={schemaId}
					symbolId={symbolIdToDelete}
					onYes={onDeleteSymbol}
					onNo={onCancelDeleteSymbol}
				/>
			)}

			<Snackbar open={isSnackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
				<Alert severity="warning" sx={{ width: '100%' }}>
					{snackbarMessage}
				</Alert>
			</Snackbar>

			<Button variant="outlined" startIcon={<AddIcon />} onClick={onAddNewGroup} sx={{ mt: 1, maxWidth: 350 }}>
				Create Group
			</Button>

			<Button
				variant="outlined"
				startIcon={<MediationIcon />}
				onClick={onRearrangeSymbols}
				sx={{ mt: 1, maxWidth: 350 }}
			>
				Rearrange Symbols
			</Button>

			<List>
				{getSymbolGroups(symbology).map((symbologyGroup, idx) => (
					<React.Fragment key={symbologyGroup.id}>
						<ListSubheader sx={{ mt: idx > 0 ? 3 : 0 }} disableGutters>
							{symbologyGroup.name}
						</ListSubheader>

						<ButtonGroup variant="text" fullWidth sx={{ mb: 1, '& > button': { maxWidth: 115 } }}>
							<Button startIcon={<AddIcon />} onClick={onAddSymbologyField(symbologyGroup.id)}>
								Add
							</Button>

							{symbologyGroup.id !== defaultSymbologyGroupId && (
								<React.Fragment>
									<Button startIcon={<EditIcon />} onClick={onClickEditGroup(symbologyGroup.id)}>
										Edit
									</Button>

									<Button
										startIcon={<DeleteIcon />}
										onClick={onClickDeleteGroup(symbologyGroup.id)}
										disabled={symbolsByGroup[symbologyGroup.id] !== undefined}
									>
										Delete
									</Button>
								</React.Fragment>
							)}
						</ButtonGroup>

						{symbolsByGroup[symbologyGroup.id] !== undefined &&
							symbolsByGroup[symbologyGroup.id].map((symbol) =>
								isRearrangingSymbols === false ? (
									<ListItem
										key={symbol.id}
										secondaryAction={
											<IconButton edge="end" onClick={handleOpenMenuClick(symbol.id)}>
												<MoreVertIcon />
											</IconButton>
										}
									>
										{mapId !== undefined && symbol.favourited_map_ids.includes(mapId) === true ? (
											<ListItemIcon onClick={onClickUnfavouriteSymbol(symbol.id)}>
												<FavoriteIcon sx={{ color: pink[500] }} />
											</ListItemIcon>
										) : (
											<ListItemIcon onClick={onClickFavouriteSymbol(symbol.id)}>
												<FavoriteBorderIcon />
											</ListItemIcon>
										)}

										<ListItemButton onClick={onEditSymbol(symbol)} disableGutters>
											{getFontAwesomeIconForSymbolPreview(symbol.props, {
												size: defaultSymbolSizeForFormFields,
											})}
											<ListItemText primary={symbol.props.name} sx={{ pl: 1 }} />
										</ListItemButton>
									</ListItem>
								) : (
									<ListItem key={symbol.id}>
										<ListItemButton
											onClick={
												symbolsToRearrange.includes(symbol.id) === false
													? onClickAddSymbolToRearrange(symbol.id)
													: onClickRemoveSymbolFromRearrange(symbol.id)
											}
											disableGutters
										>
											<ListItemIcon onClick={onClickAddSymbolToRearrange(symbol.id)}>
												{symbolsToRearrange.includes(symbol.id) === false ? (
													<CheckBoxOutlineBlankIcon color="primary" />
												) : (
													<CheckBoxIcon color="primary" />
												)}
											</ListItemIcon>

											{getFontAwesomeIconForSymbolPreview(symbol.props, {
												size: defaultSymbolSizeForFormFields,
											})}
											<ListItemText primary={symbol.props.name} sx={{ pl: 1 }} />
										</ListItemButton>
									</ListItem>
								),
							)}
					</React.Fragment>
				))}
			</List>

			<StyledMenu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleClose}>
				{symbolIdForMenu !== null && (
					<MenuItem onClick={onClickDuplicateSymbol(symbolIdForMenu)} disableRipple>
						<ContentCopyIcon />
						Duplicate
					</MenuItem>
				)}

				{symbolIdForMenu !== null && (
					<MenuItem onClick={onClickDeleteSymbol(symbolIdForMenu)} disableRipple>
						<DeleteIcon />
						Delete
					</MenuItem>
				)}
			</StyledMenu>

			{isRearrangingSymbols === true && (
				<AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
					<Toolbar>
						<Button color="inherit" onClick={onCancelRearrangingSymbols}>
							Cancel
						</Button>

						<Box sx={{ flexGrow: 1 }} />

						<Button color="inherit" onClick={onOpenGroupChooserForSymbolRearrange}>
							Move
						</Button>
					</Toolbar>
				</AppBar>
			)}

			{isAddingSymbologyField === true && (
				<SymbologyFieldEditor
					onDone={onDoneAddingSymbol}
					onCancel={onCancelAddingSymbol}
					groups={symbology.groups}
					onAddGroup={onAddGroup}
					currentGroupId={groupIdForNewSymbologyField}
					nameFieldRequired={true}
					iconFieldRequired={true}
				/>
			)}

			{symbolFieldForEditor !== undefined && (
				<SymbologyFieldEditor
					symbol={symbolFieldForEditor.props}
					onDone={onDoneEditingSymbol}
					onCancel={onCancelEditingSymbol}
					groups={symbology.groups}
					onAddGroup={onAddGroup}
					currentGroupId={symbolFieldForEditor.group_id}
					nameFieldRequired={true}
					iconFieldRequired={true}
				/>
			)}

			{isAddingGroup === true && (
				<SchemaSymbologyGroupEditor onDone={onDoneAddingGroup} onCancel={onCancelAddingGroup} />
			)}

			{groupForEditing !== null && (
				<SchemaSymbologyGroupEditor
					group={groupForEditing}
					onDone={onDoneEditingGroup}
					onCancel={onCancelEditingGroup}
				/>
			)}

			{isRearrangingSymbolsGroupChooserOpen === true && (
				<SchemaSymbologyGroupChooserForRerranging
					groups={symbology.groups}
					onDone={onDoneRearrangingSymbols}
					onCancel={onCancelChoosingGroupToRearrangeSymbolsTo}
				/>
			)}
		</React.Fragment>
	);
}

export default SchemaSymbologyManager;
