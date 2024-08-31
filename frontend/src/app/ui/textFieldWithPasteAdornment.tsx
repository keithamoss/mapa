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
			// const pastedText = await navigator.clipboard.readText();
			// onPasteFromClipboard(pastedText);
			// alert(JSON.stringify(pastedText));

			// const pastedValue = await navigator.clipboard.read();
			const clipboardContents = await navigator.clipboard.read();
			alert(`clipboardContents: ${JSON.stringify(clipboardContents)}`);

			for (const item of clipboardContents) {
				for (const mimeType of item.types) {
					// alert(`mimeType: ${mimeType}`);

					if (mimeType === 'text/html') {
						const blob = await item.getType('text/html');
						const blobText = await blob.text();
						alert(`text/html blobText: ${blobText}`);
					} else if (mimeType === 'text/plain') {
						const blob = await item.getType('text/plain');
						const blobText = await blob.text();
						alert(`text/plain blobText: ${blobText}`);
					} else if (mimeType === 'text/uri-list') {
						const blob = await item.getType('text/uri-list');
						const blobText = await blob.text();
						alert(`text/uri-list blobText: ${blobText}`);
					} else {
						throw new Error(`${mimeType} not supported.`);
					}
				}
			}
		} catch (err: unknown) {
			/* empty */
			if (err instanceof Error) {
				alert(`Things exploded (${err.message})`);
			}
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
