import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, AppBar, Button, Paper, Toolbar, Typography } from '@mui/material';
import { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { DialogWithTransition } from './app/ui/dialog';

function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
	const navigate = useNavigate();

	const onBack = () => {
		resetErrorBoundary();
		navigate(-1);
	};

	return (
		<DialogWithTransition>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					{/* <IconButton edge="start" color="inherit">
						<CloseIcon />
					</IconButton> */}
					<Typography sx={{ /*ml: 2, */ flex: 1 }} variant="h6" component="div">
						An error occured
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ m: 3 }}>
				<Alert severity="error" sx={{ mb: 3 }}>
					{error || 'An unknown error occured 😳'}
				</Alert>

				<Button color="inherit" variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
					Back
				</Button>
			</Paper>
		</DialogWithTransition>
	);
}

export default ErrorBoundaryFallback;
