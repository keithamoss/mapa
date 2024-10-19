import CloseIcon from '@mui/icons-material/Close';
import {
	AppBar,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	type SelectChangeEvent,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { QuickAddMode, useUpdateUserProfileMutation } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import { selectUser } from '../auth/authSlice';
import { getQuickAddModeOrDefault, getQuickAddSymbolCountOrDefault } from './quickAddSymbolsHelpers';

function QuickAddSymbolsSettingsManager() {
	const user = useAppSelector(selectUser);

	const navigate = useNavigate();

	const [updateUserProfile] = useUpdateUserProfileMutation();

	const onQuickAddModeChange = useCallback(
		(event: SelectChangeEvent<QuickAddMode>) => {
			if (event.target.value in QuickAddMode) {
				updateUserProfile({ quick_add_mode: event.target.value as QuickAddMode });
			}
		},
		[updateUserProfile],
	);

	const onChangeNumberOfSymbolsToShow = useCallback(
		(event: SelectChangeEvent<string>) => {
			const numberOfSymbolsToShow = Number.parseInt(event.target.value);
			if (Number.isNaN(numberOfSymbolsToShow) === false) {
				updateUserProfile({ quick_add_symbol_count: numberOfSymbolsToShow });
			}
		},
		[updateUserProfile],
	);

	const onClose = useCallback(() => navigate('/'), [navigate]);

	if (user === null) {
		return null;
	}

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Quick Add Settings
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					<FormControl fullWidth={true} sx={{ mb: 3 }}>
						These settings allow you to control the symbols that are shown on the map. You may choose between using
						symbols you&apos;ve recently added, your most popular and often used symbols, or symbols you&apos;ve
						favourited.
					</FormControl>

					<FormControl sx={{ mb: 3 }} fullWidth>
						<InputLabel id="quick-add-mode-label">Mode</InputLabel>

						<Select
							labelId="quick-add-mode-label"
							label="Mode"
							value={getQuickAddModeOrDefault(user.settings)}
							onChange={onQuickAddModeChange}
						>
							{Object.entries(QuickAddMode).map(([name, id]) => (
								<MenuItem key={id} value={id}>
									{name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<InputLabel id="quick-add-symbol-count-label">Number of symbols to show</InputLabel>

						<Select
							labelId="quick-add-symbol-count-label"
							label="Number of symbols to show"
							value={`${getQuickAddSymbolCountOrDefault(user.settings)}`}
							onChange={onChangeNumberOfSymbolsToShow}
						>
							{Object.values([1, 2, 3, 4, 5]).map((number) => (
								<MenuItem key={number} value={number}>
									{number}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default QuickAddSymbolsSettingsManager;
