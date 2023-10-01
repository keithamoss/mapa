import { AddLocationAlt, Schema } from '@mui/icons-material';
import MapIcon from '@mui/icons-material/Map';
import { Alert, AlertTitle, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledDiv = styled('div')(({ theme }) => ({
	width: '100dvw',
	height: '100dvh',
	paddingRight: theme.spacing(4),
	paddingLeft: theme.spacing(4),
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'left',
}));

function WelcomeUser() {
	return (
		<StyledDiv>
			<Alert severity="info">
				<AlertTitle>Welcome to Mapa!</AlertTitle>
				These are some nice words to welcome our user for the first time.
				<br />
				<br />
				Mapa has three concepts you&apos;ll need to know about.
				<br />
				<p>
					<MapIcon color="primary" /> <strong>Maps</strong> that let you do some cool stuff like this and that.
				</p>
				<p>
					<Schema color="primary" /> <strong>Schemas</strong> that let you do other cool stuff like this and that.
				</p>
				<p>
					<AddLocationAlt /> <strong>Features</strong> that let you do even cooler stuff like this and that.
				</p>
				<p>To get started, let&apos;s create a map.</p>
				<Link to="/MapManager/Create">
					<Button variant="outlined" startIcon={<MapIcon color="primary" />}>
						Create your first map
					</Button>
				</Link>
			</Alert>
		</StyledDiv>
	);
}

export default WelcomeUser;
