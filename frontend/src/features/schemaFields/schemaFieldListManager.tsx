import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NumbersIcon from '@mui/icons-material/Numbers';
import PhotoIcon from '@mui/icons-material/Photo';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TodayIcon from '@mui/icons-material/Today';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { type FeatureSchemaFieldDefinitionCollection, FeatureSchemaFieldType } from '../../app/services/schemas';
import { StyledMenu } from '../../app/ui/styledMenu';
import SchemaFieldDeleteManager from '../schemas/schemaFieldDeleteManager';
import { moveFieldDown, moveFieldUp, removeField } from '../schemas/schemaHelpers';
import { getFieldFromSchemaById } from '../schemas/schemasSlice';
import SchemaFieldCreatorAndEditor from './schemaFieldCreatorAndEditor';

const getIconForSchemaFieldType = (field: FeatureSchemaFieldDefinitionCollection) => {
	switch (field.type) {
		case FeatureSchemaFieldType.TextField:
			return <TextFieldsIcon />;
		case FeatureSchemaFieldType.NumberField:
			return <NumbersIcon />;
		case FeatureSchemaFieldType.BooleanField:
			return <CheckBoxIcon />;
		case FeatureSchemaFieldType.SymbologyFieldBoolean:
			return <PhotoIcon />;
		case FeatureSchemaFieldType.DateField:
			return <TodayIcon />;
		case FeatureSchemaFieldType.URLField:
			return <LinkIcon />;
		default:
			return <QuestionMarkIcon />;
	}
};

interface Props {
	schemaId?: number;
	schemaDefinition: FeatureSchemaFieldDefinitionCollection[];
	onSchemaDefinitionChange: (definition: FeatureSchemaFieldDefinitionCollection[]) => void;
}

function SchemaFieldListManager(props: Props) {
	const { schemaId, schemaDefinition, onSchemaDefinitionChange } = props;

	const [fieldToEdit, setFieldToEdit] = useState<FeatureSchemaFieldDefinitionCollection | undefined>();

	const onEditField = (fieldId: number) => () => {
		setFieldToEdit(getFieldFromSchemaById(fieldId, schemaDefinition));
	};

	const onDoneEditingField = (field: FeatureSchemaFieldDefinitionCollection) => {
		const definition = [...(schemaDefinition || [])];
		const idx = definition?.findIndex((f) => f.id === field.id);

		if (idx !== -1) {
			definition[idx] = field;

			onSchemaDefinitionChange(definition);

			setFieldToEdit(undefined);
		}
	};

	const onCancelEditingField = () => setFieldToEdit(undefined);

	// ######################
	// Menu
	// ######################
	const [fieldIdForMenu, setFieldIdForMenu] = useState<number | null>(null);
	const [fieldIdx, setFieldIdx] = useState<number | null>(null);

	const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
	const isMenuOpen = Boolean(menuAnchorEl);

	const handleOpenMenuClick = (fieldId: number, idx: number) => (event: React.MouseEvent<HTMLElement>) => {
		setFieldIdForMenu(fieldId);
		setFieldIdx(idx);
		setMenuAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setFieldIdForMenu(null);
		setFieldIdx(null);
		setMenuAnchorEl(null);
	};
	// ######################
	// Menu (End)
	// ######################

	// ######################
	// Reorder Field
	// ######################
	const onMoveFieldUp = () => {
		if (fieldIdForMenu !== null) {
			const local_definition = moveFieldUp(fieldIdForMenu, schemaDefinition);
			if (local_definition !== null) {
				onSchemaDefinitionChange(local_definition);
			}
		}
	};

	const onMoveFieldDown = () => {
		if (fieldIdForMenu !== null) {
			const local_definition = moveFieldDown(fieldIdForMenu, schemaDefinition);
			if (local_definition !== null) {
				onSchemaDefinitionChange(local_definition);
			}
		}
	};
	// ######################
	// Reorder Field (End)
	// ######################

	// ######################
	// Delete Field
	// ######################
	const [fieldIdToDelete, setFieldIdToDelete] = useState<number | undefined>(undefined);

	const onClickDeleteField = (fieldId: number) => () => {
		if (schemaId === undefined) {
			// Schema hasn't been created yet, so we're safe to delete w/o checking
			onSchemaDefinitionChange(removeField(fieldId, schemaDefinition));
			setFieldIdToDelete(undefined);
		} else {
			// SchemaFieldDeleteManager checks the backend for us first to see if we're safe to delete
			setFieldIdToDelete(fieldId);
		}

		handleClose();
	};

	const onDeleteField = (fieldId: number) => {
		onSchemaDefinitionChange(removeField(fieldId, schemaDefinition));
		setFieldIdToDelete(undefined);
	};

	const onCancelDeleteField = () => setFieldIdToDelete(undefined);
	// ######################
	// Delete Field (End)
	// ######################

	return (
		<React.Fragment>
			{schemaId !== undefined && fieldIdToDelete !== undefined && (
				<SchemaFieldDeleteManager
					schemaId={schemaId}
					fieldId={fieldIdToDelete}
					onYes={onDeleteField}
					onNo={onCancelDeleteField}
				/>
			)}

			<List>
				{schemaDefinition.map((field, idx) => (
					<ListItem
						key={field.id}
						// disablePadding={true}
						secondaryAction={
							<IconButton edge="end" onClick={handleOpenMenuClick(field.id, idx)}>
								<MoreVertIcon />
							</IconButton>
						}
					>
						<ListItemButton onClick={onEditField(field.id)} disableGutters>
							<ListItemIcon>{getIconForSchemaFieldType(field)}</ListItemIcon>
							<ListItemText primary={field.name} /*secondary={FeatureSchemaFieldTypeLabel[field.type]}*/ />
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<StyledMenu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleClose}>
				{fieldIdx !== null && fieldIdx > 0 && (
					<MenuItem onClick={onMoveFieldUp} disableRipple>
						<ArrowCircleUpIcon />
						Up
					</MenuItem>
				)}

				{fieldIdx !== null && fieldIdx < schemaDefinition.length - 1 && (
					<MenuItem onClick={onMoveFieldDown} disableRipple>
						<ArrowCircleDownIcon />
						Down
					</MenuItem>
				)}

				{fieldIdx !== null && (
					<MenuItem onClick={onClickDeleteField(schemaDefinition[fieldIdx].id)} disableRipple>
						<DeleteIcon />
						Delete
					</MenuItem>
				)}
			</StyledMenu>

			{fieldToEdit !== undefined && (
				<SchemaFieldCreatorAndEditor
					fieldToEdit={fieldToEdit}
					onDoneEditing={onDoneEditingField}
					onCancel={onCancelEditingField}
				/>
			)}
		</React.Fragment>
	);
}

export default SchemaFieldListManager;
