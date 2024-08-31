import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';
import { isClipboardApiSupported } from '../utils';

interface Props {
	pastingDisabled?: boolean;
	onPasteFromClipboard: (pastedText: string) => void;
}

const TextFieldWithPasteAdornment = (props: TextFieldProps & Props, ref: ForwardedRef<HTMLDivElement>) => {
	const { pastingDisabled, onPasteFromClipboard, InputProps, ...rest } = props;

	const onClickPaste = async () => {
		try {
			onPasteFromClipboard(await navigator.clipboard.readText());
		} catch {
			/* empty */
		}
	};

	// This is here because the MUI example had it.
	// Ref: https://mui.com/material-ui/react-text-field/#input-adornments
	const handleMouseDownOnClickPaste = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<TextField
			ref={ref}
			InputProps={{
				...InputProps,
				endAdornment:
					isClipboardApiSupported() === true && pastingDisabled !== true ? (
						<InputAdornment position="end">
							<IconButton onClick={onClickPaste} onMouseDown={handleMouseDownOnClickPaste} edge="end">
								<ContentPasteGoIcon />
							</IconButton>
						</InputAdornment>
					) : undefined,
			}}
			{...rest}
		/>
	);
};

export default forwardRef(TextFieldWithPasteAdornment);
