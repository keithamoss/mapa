import AddLinkIcon from '@mui/icons-material/AddLink';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useState } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { FeatureDataItemURLFieldLinkItem } from '../../../app/services/features';
import { type FeatureSchemaFieldDefinitionURLField, FeatureSchemaFieldType } from '../../../app/services/schemas';
import { getLinkDomainName } from '../../../app/utils';
import type { SchemaFormFieldsFormValues } from '../schemaFieldDataEntryManager';
import {
	addLinkToURLField,
	modifyLinkInURLField,
	moveLinkDownInURLField,
	moveLinkUpInURLField,
	removeLinkFromURLField,
} from './schemaDataEntryURLFieldHelpers';
import SchemaDataEntryURLFieldLinkItemForm from './schemaDataEntryURLFieldLinkItemForm';

interface Props {
	schemaField: FeatureSchemaFieldDefinitionURLField;
	watch: UseFormWatch<SchemaFormFieldsFormValues>;
	setValue: UseFormSetValue<SchemaFormFieldsFormValues>;
}

function SchemaDataEntryURLField(props: Props) {
	const { schemaField, watch, setValue } = props;

	// This is safe enough because we know for sure what the value looks like
	const { [`schema_field_${schemaField.id}`]: watchedURLFieldValue } = watch();
	const urlFieldValue = watchedURLFieldValue as FeatureDataItemURLFieldLinkItem[];

	// ######################
	// Add and Edit Link
	// ######################
	const [isURLFieldLinkItemFormOpen, setIsURLFieldLinkItemFormOpen] = useState(false);

	const onCancelAddingOrEditingLink = () => {
		setURLFieldLinkItemIdForEditing(undefined);
		setIsURLFieldLinkItemFormOpen(false);
	};
	// ######################
	// Add and Edit Link (End)
	// ######################

	// ######################
	// Add Link
	// ######################
	const onAddLink = () => setIsURLFieldLinkItemFormOpen(true);

	const onDoneAddingLink = (linkItemData: FeatureDataItemURLFieldLinkItem) => {
		setValue(`schema_field_${schemaField.id}`, addLinkToURLField(linkItemData, urlFieldValue), { shouldDirty: true });

		setIsURLFieldLinkItemFormOpen(false);
	};
	// ######################
	// Add Link (End)
	// ######################

	// ######################
	// Edit Link
	// ######################
	const [urlFieldLinkItemIdForEditing, setURLFieldLinkItemIdForEditing] = useState<string | undefined>(undefined);

	const onEditLink = (linkId: string) => () => {
		setURLFieldLinkItemIdForEditing(linkId);
		setIsURLFieldLinkItemFormOpen(true);
	};

	const onDoneEditingLink = (linkItemData: FeatureDataItemURLFieldLinkItem) => {
		if (urlFieldLinkItemIdForEditing !== undefined) {
			setValue(`schema_field_${schemaField.id}`, modifyLinkInURLField(linkItemData, urlFieldValue), {
				shouldDirty: true,
			});

			setURLFieldLinkItemIdForEditing(undefined);
			setIsURLFieldLinkItemFormOpen(false);
		}
	};
	// ######################
	// Edit Link (End)
	// ######################

	// ######################
	// Delete Link
	// ######################
	const [urlFieldLinkIdToDelete, setURLFieldLinkIdToDelete] = useState<string | undefined>(undefined);

	const onDeleteLink = (linkId: string) => () => setURLFieldLinkIdToDelete(linkId);

	const onConfirmDeleteLink = () => {
		if (urlFieldLinkIdToDelete !== undefined) {
			setValue(`schema_field_${schemaField.id}`, removeLinkFromURLField(urlFieldLinkIdToDelete, urlFieldValue), {
				shouldDirty: true,
			});

			setURLFieldLinkIdToDelete(undefined);
		}
	};

	const onCancelDeleteLink = () => setURLFieldLinkIdToDelete(undefined);
	// ######################
	// Delete Link (End)
	// ######################

	// ######################
	// Move Link
	// ######################
	const onMoveLinkUp = (linkId: string) => () => {
		const localURLField = moveLinkUpInURLField(linkId, urlFieldValue);

		if (localURLField !== null) {
			setValue(`schema_field_${schemaField.id}`, localURLField, { shouldDirty: true });
		}
	};

	const onMoveLinkDown = (linkId: string) => () => {
		const localURLField = moveLinkDownInURLField(linkId, urlFieldValue);

		if (localURLField !== null) {
			setValue(`schema_field_${schemaField.id}`, localURLField, { shouldDirty: true });
		}
	};
	// ######################
	// Move Link (End)
	// ######################

	if (schemaField.type !== FeatureSchemaFieldType.URLField) {
		return null;
	}

	return (
		<React.Fragment>
			<Typography
				variant="subtitle2"
				sx={{ mb: 1, display: 'inline-flex', flexDirection: 'row', alignItems: 'center' }}
			>
				<LinkIcon sx={{ mr: 1 }} />
				{schemaField.name}
			</Typography>

			<Button variant="outlined" startIcon={<AddLinkIcon />} onClick={onAddLink} sx={{ mt: 1, mb: 1, maxWidth: 350 }}>
				Add Link
			</Button>

			<Box>
				<List disablePadding>
					{urlFieldValue.map((urlFieldItem, index) => (
						<ListItem
							key={urlFieldItem.id}
							disablePadding
							sx={{
								'& .MuiListItemButton-root': {
									pl: 1,
									pr: 14, // We need a lot of padding here to support the three <IconButton>s on the right of each <ListItem>
								},
							}}
							secondaryAction={
								<Box
									sx={{
										display: 'inline-flex',
										flexDirection: 'row',
										justifyContent: 'space-evenly',
										columnGap: '5px',
									}}
								>
									{index >= 1 && (
										<Tooltip title="Move Up">
											<IconButton edge="end" onClick={onMoveLinkUp(urlFieldItem.id)}>
												<MoveUpIcon />
											</IconButton>
										</Tooltip>
									)}

									{index < urlFieldValue.length - 1 && (
										<Tooltip title="Move Down">
											<IconButton edge="end" onClick={onMoveLinkDown(urlFieldItem.id)}>
												<MoveDownIcon />
											</IconButton>
										</Tooltip>
									)}

									<Tooltip title="Delete">
										<IconButton edge="end" onClick={onDeleteLink(urlFieldItem.id)}>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								</Box>
							}
						>
							<ListItemButton disableGutters onClick={onEditLink(urlFieldItem.id)}>
								<ListItemText
									primary={urlFieldItem.name}
									secondary={getLinkDomainName(urlFieldItem.url) || 'Unknown Domain'}
								></ListItemText>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>

			{isURLFieldLinkItemFormOpen === true && (
				<SchemaDataEntryURLFieldLinkItemForm
					urlFieldLinkItem={
						urlFieldLinkItemIdForEditing !== undefined
							? urlFieldValue.find((i) => i.id === urlFieldLinkItemIdForEditing)
							: undefined
					}
					onDoneAdding={onDoneAddingLink}
					onDoneEditing={onDoneEditingLink}
					onCancel={onCancelAddingOrEditingLink}
				/>
			)}

			{urlFieldLinkIdToDelete !== undefined && (
				<Dialog open={true} onClose={onCancelDeleteLink}>
					<DialogTitle>Delete link</DialogTitle>
					<DialogContent>Are your sure?</DialogContent>
					<DialogActions>
						<Button onClick={onCancelDeleteLink}>No</Button>
						<Button onClick={onConfirmDeleteLink}>Yes</Button>
					</DialogActions>
				</Dialog>
			)}
		</React.Fragment>
	);
}

export default SchemaDataEntryURLField;
