import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';

import Box from '@mui/material/Box';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';

const CircularProgressWithLabel = (props: CircularProgressProps & { value: number }) => (
	<Box sx={{ position: 'relative', display: 'inline-flex' }}>
		<CircularProgress variant="indeterminate" {...props} />
		<Box
			sx={{
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				position: 'absolute',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{props.value % 20 === 0 ? <GpsFixedIcon color="primary" /> : <GpsNotFixedIcon color="primary" />}
		</Box>
	</Box>
);

export default function LocationFetchingIndicator() {
	const [progress, setProgress] = useState(10);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
		}, 700);
		return () => {
			clearInterval(timer);
		};
	}, []);

	return <CircularProgressWithLabel value={progress} />;
}
