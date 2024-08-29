import { Dialog, DialogProps, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useUnmount } from '../hooks/useUnmount';
import { defaultAppBarColour, defaultNakedNonFullScreenDialogColour, getThemeColour, setThemeColour } from './theme';

const Transition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
	onClose?: () => void;
	children: React.ReactNode;
	dialogProps?: Partial<DialogProps>;
	transitionProps?: Partial<TransitionProps>;
	themeColour?: string;
	// Allows us to use autoFocus on inputs et cetera
	// Ref: https://stackoverflow.com/a/76533962/7368493
	disableRestoreFocus?: boolean;
}
export const DialogWithTransition = ({
	onClose,
	children,
	dialogProps,
	transitionProps,
	themeColour = dialogProps?.fullScreen === false ? defaultNakedNonFullScreenDialogColour : defaultAppBarColour,
	disableRestoreFocus,
}: Props) => {
	const previousThemeColourRef = useRef<string | undefined>();
	// This enteredRef never quite worked. It's goal was to stop seeing the brief flash of
	// the default creamy white/grey colour when switching between two layers of dialogs.
	// const enteredRef = useRef(false);

	useEffect(() => {
		previousThemeColourRef.current = getThemeColour();
	}, []);

	const onDialogClose = () => {
		if (previousThemeColourRef.current !== undefined) {
			setThemeColour(previousThemeColourRef.current);
		}

		if (onClose !== undefined) {
			onClose();
		}
	};

	useUnmount(() => {
		if (
			/*enteredRef.current === true &&*/
			previousThemeColourRef.current !== undefined
		) {
			setThemeColour(previousThemeColourRef.current);
		}
	});

	return (
		<Dialog
			fullScreen
			open={true}
			onClose={onDialogClose}
			disableRestoreFocus={disableRestoreFocus}
			// transitionDuration={0}
			TransitionComponent={Transition}
			TransitionProps={{
				...transitionProps,
				onEntered: (node: HTMLElement, isAppearing: boolean) => {
					if (dialogProps?.fullScreen !== false) {
						setThemeColour(themeColour);
						// enteredRef.current = true;
					}

					if (transitionProps?.onEntered !== undefined) {
						transitionProps.onEntered(node, isAppearing);
					}
				},
				// This works better with non-full screen dialogs than onEntered
				addEndListener: (node: HTMLElement, done: () => void) => {
					if (dialogProps?.fullScreen === false) {
						setThemeColour(themeColour);
						// enteredRef.current = true;
					}

					if (transitionProps?.addEndListener !== undefined) {
						transitionProps.addEndListener(node, done);
					}
				},
			}}
			{...dialogProps}
		>
			{children}
		</Dialog>
	);
};
