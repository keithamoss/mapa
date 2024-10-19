/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, FormControl, FormGroup, IconButton, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { DialogWithTransition } from '../../app/ui/dialog';
import { selectUser } from '../auth/authSlice';
import type { IconStyle } from '../symbology/iconsLibraryInterfaces';
import { getFontAwesomeIconForSymbolPreview } from '../symbology/symbologyHelpers';

const iconDefs = [
	{
		id: 1,
		props: {
			icon: 'lemon-fruits4',
			name: 'Citrus',
			icon_style: 'coloured' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 1,
		props: {
			icon: 'lemon-fruits4',
			name: 'Citrus Blobby',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle-question',
			modifier_colour: '#FFFFFF',
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 1,
		props: {
			icon: 'lemon-fruits7',
			name: 'Citrus Not Blobby',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle-question',
			modifier_colour: '#FFFFFF',
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 1,
		props: {
			icon: 'broccoli',
			name: 'Bush Not Blobby',
			// icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle-question',
			modifier_colour: '#FFFFFF',
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 1,
		props: {
			icon: 'lemon-fruits4',
			name: 'Citrus Bush',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'duotone' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 1,
		props: {
			icon: 'guava-fruits1',
			name: 'Guava Naked',
			icon_style: 'coloured' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 2,
		props: {
			icon: 'guava-fruits1',
			name: 'Guava Circle',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 2,
		props: {
			icon: 'guava-fruits1',
			name: 'Guava Circle',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'duotone' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 3,
		props: {
			icon: 'guava-fruits1',
			name: 'Guava Circle Yellow',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle',
			modifier_icon_style: 'solid' as IconStyle,
			modifier_circle_colour: '#f0f40b',
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 4,
		props: {
			icon: 'guava-fruits1',
			name: 'Guava Circle Yellow MIcon Colour Set',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle',
			modifier_colour: '#09f505',
			modifier_icon_style: 'solid' as IconStyle,
			modifier_circle_colour: '#f0f40b',
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'quince-fruits9',
			name: 'Lemon guava',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle',
			modifier_circle_colour: '#e4e66b',
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'fig-fruits1',
			name: 'Fig',
			icon_style: 'coloured' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'fig-fruits1',
			name: 'Fig Bush',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'fig-fruits1',
			name: 'Fig Salt',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'salt-shaker',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Fig',
			icon_style: 'solid' as IconStyle,
			modifier_icon: 'fig-fruits1',
			modifier_icon_style: 'coloured' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'broccoli',
			name: 'Bush Fig',
			icon_style: 'duotone' as IconStyle,
			secondary_colour: '#FF0000',
			modifier_icon: 'fig-fruits1',
			modifier_icon_style: 'coloured' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'fig-fruits1',
			name: 'Fig Fig',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'fig-fruits1',
			modifier_icon_style: 'coloured' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 26,
		props: {
			icon: 'fig-fruits1',
			name: 'Fig Circle',
			icon_style: 'coloured' as IconStyle,
			modifier_icon: 'circle-a',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 2,
		favourited_map_ids: [],
	},
	{
		id: 28,
		props: {
			icon: 'broccoli',
			name: 'Bush Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 28,
		props: {
			icon: 'broccoli',
			icon_style: 'duotone' as IconStyle,
			secondary_colour: '#FF0000',
			name: 'Bush Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 28,
		props: {
			icon: 'broccoli',
			icon_style: 'duotone' as IconStyle,
			secondary_colour: '#FF0000',
			name: 'Bush Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'duotone' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 31,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 31,
		props: {
			icon: 'salt-shaker',
			icon_style: 'duotone' as IconStyle,
			secondary_colour: '#FF0000',
			name: 'Salt Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'duotone' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 29,
		props: {
			icon: 'broccoli',
			name: 'Bush Salt',
			modifier_icon: 'salt-shaker',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 29,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Salt',
			modifier_icon: 'salt-shaker',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'circle-a',
			name: 'Circle Salt',
			modifier_icon: 'salt-shaker',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Circle',
			modifier_icon: 'circle-a',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Salt',
			modifier_icon: 'salt-shaker',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'circle-a',
			name: 'Circle Circle',
			modifier_icon: 'circle-a',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'broccoli',
			name: 'Bush Circle',
			modifier_icon: 'circle-a',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'circle-a',
			name: 'Circle Bush',
			modifier_icon: 'broccoli',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'salt-shaker',
			name: 'Salt Circle',
			modifier_icon: 'circle-a',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
	{
		id: 30,
		props: {
			icon: 'circle-a',
			name: 'Circle Salt',
			modifier_icon: 'salt-shaker',
			modifier_colour: '#d52a2a',
			modifier_icon_style: 'solid' as IconStyle,
		},
		group_id: 1,
		favourited_map_ids: [],
	},
];

export const flatIconDefs = [
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"apple-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"berry-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"almond-nature2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(149, 15, 124, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"wheat","iconStyle":"duotone"}',
	'{"iconProps":{"colour":"rgba(149, 15, 124, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"wheat","iconStyle":"duotone"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"aniseed-herbsandspices2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"apple-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"apple-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"apricot-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"avocado-vegetables7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"avocado-vegetables7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"banana-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"basil-vegetables4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"black-sapote-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pepper-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"capsicum-vegetables6","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"dog-rose-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"cherry-tomato-vegetables6","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"chili-pepper-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"gooseberry-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"chives-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"coriander-nature1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"cranberry-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"kumquat-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"kumquat-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"kumquat-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fennel-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"eggplant-vegetables7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"vanilla-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"vanilla-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"feijoa-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"tarragon-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"cherry-blossom-nature3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grapefruit-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grapefruit-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grapefruit-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"guava-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"guava-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"blueberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"plum-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lavender-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle","modifierColour":"rgba(228, 230, 107, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"quince-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"dog-rose-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lime-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lime-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mango-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mango-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mango-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"location-question","iconStyle":"solid"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"guava-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"basil-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"basil-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"location-question","iconStyle":"solid"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"nasturtium-nature3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"nectarine-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mint-nature1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mint-nature1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 0.5)","modifierOpacity":0.5,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"oregano-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"papaya-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"parsley-herbsandspices2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"passion-fruit-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"passion-fruit-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"passion-fruit-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"peach-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"peach-fruits8","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pear-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pear-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pea-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"prickly-pear-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"prickly-pear-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pumpkin-vegetables3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"quince-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"raspberry-fruits3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"rose-hip-nature2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"rosemary-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"sage-herbsandspices2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"peach-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"spring-onion-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"quince-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"thyme-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"tomato-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pepper-herbsandspices1","iconStyle":"coloured-outlined"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(79, 132, 181, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"faucet-drip","iconStyle":"duotone"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":54,"height":54,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"white-sapote-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"apple-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(149, 15, 124, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"wheat","iconStyle":"duotone"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"basil-vegetables4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pepper-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"cherry-tomato-vegetables6","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"chili-pepper-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits4","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"kumquat-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"fig-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"cherry-blossom-nature3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"grape-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lavender-miscellaneous1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lemon-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"dog-rose-fruits7","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lime-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"lime-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"loquat-fruits5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mandarin-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mango-fruitsandveggies5","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"location-question","iconStyle":"solid"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"basil-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mulberry-fruits1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"nasturtium-nature3","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"mint-nature1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-plus","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"olive-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 0.5)","modifierOpacity":0.5,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-question","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"orange-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"parsley-herbsandspices2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"passion-fruit-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"passion-fruit-fruits9","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"circle-arrow-up","modifierColour":"rgba(0, 0, 0, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"pomegranate-fruitsandveggies1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"rosemary-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"sage-herbsandspices2","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(152, 150, 150, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"thyme-herbsandspices1","iconStyle":"coloured"}',
	'{"iconProps":{"colour":"rgba(24, 49, 83, 1)","opacity":1,"secondaryColour":"rgba(79, 132, 181, 1)","secondaryOpacity":0.4,"tertiaryColour":"rgba(166, 166, 166, 1)","tertiaryOpacity":1,"modifierIcon":"","modifierColour":"rgba(24, 49, 83, 1)","modifierOpacity":1,"width":27,"height":27,"rotation":0,"backgroundColour":"rgba(255, 255, 255, 0.012)"},"iconName":"faucet-drip","iconStyle":"duotone"}',
];

function SymbolsDebugView() {
	const user = useAppSelector(selectUser);

	const navigate = useNavigate();

	const onClose = () => navigate('/');

	if (user === null) {
		return null;
	}

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Debug
					</Typography>
				</Toolbar>
			</AppBar>

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<FormGroup>
					{iconDefs.map((iconDef, idx) => {
						return (
							<ListItem key={idx} sx={{ backgroundColor: 'grey' }}>
								{getFontAwesomeIconForSymbolPreview(iconDef.props, {
									// size: defaultSymbolSizeForFormFields,
									size: 75,
								})}
								<ListItemText primary={iconDef.props.name} />
							</ListItem>
						);
					})}

					{/* {getIconsForCategory('vegetables-(coloured)').map((iconSearchResult) => (
						<ListItem key={iconSearchResult.name} disablePadding>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										sx={{
											bgcolor: grey[50],
											width: '105px',
											height: '105px',
											'& > img': { width: 85, height: 85 },
										}}
									>
										{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
									</Avatar>
								</ListItemAvatar>

								{getAvailableStylesForIcon(iconSearchResult.name)
									.reverse()
									.filter((styleName) => ['coloured'].includes(styleName) === false)
									.map((styleName) => (
										<ListItemAvatar key={styleName}>
											<Avatar
												sx={{
													bgcolor: grey[50],
													width: '105px',
													height: '105px',
													'& > img': { width: 85, height: 85 },
												}}
											>
												{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name, styleName)}
											</Avatar>
										</ListItemAvatar>
									))}
								<ListItemText primary={iconSearchResult.label} secondary={iconSearchResult.name}></ListItemText>
							</ListItemButton>
						</ListItem>
					))} */}
				</FormGroup>
			</FormControl>

			{/* <FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<FormGroup>
					{flatIconDefs.map((iconDefsJSON, idx) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const iconDefs: any = JSON.parse(iconDefsJSON);
						return (
							<ListItem key={idx} disablePadding>
								<ListItemButton>
									<Box
										sx={{
											bgcolor: grey[100],
											ml: 2,
											'& > img': { width: 170, height: 170, backgroundColor: 'purple' },
										}}
									>
										<img
											src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
												{ ...iconDefs.iconProps, ...{ modifierIcon: '', modifierColour: '', modifierOpacity: 1 } },
												iconDefs.iconName,
												iconDefs.iconStyle,
											)}`}
										/>
									</Box>

									<Box
										sx={{
											bgcolor: grey[100],
											ml: 2,
											'& > img': { width: 170, height: 170, backgroundColor: 'purple' },
										}}
									>
										<img
											src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
												{
													...iconDefs.iconProps,
													...{
														modifierIcon: 'circle-question',
														modifierColour: 'rgba(0, 0, 0, 1)',
														modifierOpacity: 1,
													},
												},
												iconDefs.iconName,
												iconDefs.iconStyle,
											)}`}
										/>
									</Box>

									<Box
										sx={{
											bgcolor: grey[100],
											ml: 2,
											'& > img': { width: 170, height: 170, backgroundColor: 'purple' },
										}}
									>
										<img
											src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
												{
													...iconDefs.iconProps,
													...{
														modifierIcon: 'circle-plus',
														modifierColour: 'rgba(0, 0, 0, 1)',
														modifierOpacity: 1,
													},
												},
												iconDefs.iconName,
												iconDefs.iconStyle,
											)}`}
										/>
									</Box>

									<Box
										sx={{
											bgcolor: grey[100],
											ml: 2,
											'& > img': { width: 170, height: 170, backgroundColor: 'purple' },
										}}
									>
										<img
											src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
												{
													...iconDefs.iconProps,
													...{
														modifierIcon: 'circle-arrow-up',
														modifierColour: 'rgba(0, 0, 0, 1)',
														modifierOpacity: 1,
													},
												},
												iconDefs.iconName,
												iconDefs.iconStyle,
											)}`}
										/>
									</Box>
								</ListItemButton>
							</ListItem>
						);
					})}
				</FormGroup>
			</FormControl> */}

			{/* <FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<FormGroup>
					{searchIcons('zzzz').map((iconSearchResult) => (
						<ListItem key={iconSearchResult.name} disablePadding>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										sx={{
											bgcolor: grey[50],
											width: '105px',
											height: '105px',
											'& > img': { width: 85, height: 85 },
										}}
									>
										{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={iconSearchResult.label} secondary={iconSearchResult.name}></ListItemText>
							</ListItemButton>
						</ListItem>
					))}

					{getIconsForCategory('vegetables-(coloured)').map((iconSearchResult) => (
						<ListItem key={iconSearchResult.name} disablePadding>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										sx={{
											bgcolor: grey[50],
											width: '105px',
											height: '105px',
											'& > img': { width: 85, height: 85 },
										}}
									>
										{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name)}
									</Avatar>
								</ListItemAvatar>

								{getAvailableStylesForIcon(iconSearchResult.name)
									.reverse()
									.filter((styleName) => ['coloured'].includes(styleName) === false)
									.map((styleName) => (
										<ListItemAvatar key={styleName}>
											<Avatar
												sx={{
													bgcolor: grey[50],
													width: '105px',
													height: '105px',
													'& > img': { width: 85, height: 85 },
												}}
											>
												{getFontAwesomeIconFromLibraryAsSVGImage(iconSearchResult.name, styleName)}
											</Avatar>
										</ListItemAvatar>
									))}
								<ListItemText primary={iconSearchResult.label} secondary={iconSearchResult.name}></ListItemText>
							</ListItemButton>
						</ListItem>
					))}
				</FormGroup>
			</FormControl> */}
		</DialogWithTransition>
	);
}

export default SymbolsDebugView;
