import CloseIcon from '@mui/icons-material/Close';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useCallback, useState } from 'react';
import type { FeatureSchema } from '../../services/schemas';
import { mapaThemePrimaryGreen } from '../theme';
import styles from './swipeableListItem.module.css';

// Inspired by: https://codesandbox.io/s/3filx?file=/src/App.tsx via the
// React Spring examples: https://www.react-spring.dev/examples

const left = {
	bg: `linear-gradient(120deg, #ffffff 0%, ${mapaThemePrimaryGreen} 100%)`,
	justifySelf: 'end',
};

const right = {
	bg: `linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)`,
	justifySelf: 'start',
};

interface Props {
	schema: FeatureSchema;
	onClick: () => void;
	onActionTriggered: () => void;
}

export default function SwipeableListItem(props: Props) {
	const { schema, onClick, onActionTriggered } = props;

	const [actionTriggered, setActionTriggered] = useState(false);

	const [{ x, bg, scale, justifySelf }, api] = useSpring(() => ({
		x: 0,
		scale: 1,
		...left,
	}));

	const horizontalDragDistanceThreshold = 115;

	// https://github.com/mui/material-ui/issues/15662#issuecomment-492771975
	// A standard list item is 64 pixels high, so we'll assume that to start with
	const [height, setHeight] = useState(64);
	const listItemRef = useCallback((node: HTMLLIElement) => {
		if (node !== null) {
			setHeight(node.getBoundingClientRect().height);
		}
	}, []);

	const bind = useDrag(
		({ active, movement: [x], down }) => {
			if (actionTriggered === false && Math.abs(x) >= horizontalDragDistanceThreshold && down === false) {
				setActionTriggered(true);
				onActionTriggered();
			}

			if (active === false) {
				setActionTriggered(false);
			}

			api.start({
				// `x <= 0` here ensures we can't actually drag to the
				// right to show the icon that's on the left-hand side
				x: active && x <= 0 ? x : 0,
				scale: active ? 1.1 : 1,
				...(x < 0 ? left : right),
				immediate: (name) => active && name === 'x',
			});
		},
		{ axis: 'x' },
	);

	const avSize = x.to({
		map: Math.abs,
		range: [horizontalDragDistanceThreshold * 0.8, horizontalDragDistanceThreshold],
		output: [0.5, 1.5],
		extrapolate: 'clamp',
	});

	return (
		<animated.div
			{...bind()}
			className={styles.item}
			style={{ background: bg, touchAction: 'pan-y', height }}
			onClick={onClick}
		>
			<animated.div className={styles.av} style={{ scale: avSize, justifySelf, position: 'absolute', right: 10 }}>
				<IconButton edge="end" sx={{ ml: 1, mr: 1, color: blueGrey[900] }}>
					<ForkRightIcon />
				</IconButton>
			</animated.div>

			<animated.div className={styles.av} style={{ scale: avSize, justifySelf, position: 'absolute', left: 10 }}>
				<IconButton edge="end" sx={{ ml: 1, mr: 1, color: blueGrey[900] }}>
					<CloseIcon />
				</IconButton>
			</animated.div>

			<animated.div className={styles.fg} style={{ x, scale }}>
				<ListItem ref={listItemRef}>
					<ListItemText primary={schema.name} sx={{ p: 1 }} />
				</ListItem>
			</animated.div>
		</animated.div>
	);
}
