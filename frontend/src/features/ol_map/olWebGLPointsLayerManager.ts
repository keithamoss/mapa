import { Map } from 'ol';

import BaseEvent from 'ol/events/Event';
import { Geometry, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { SymbologyProps } from '../../app/services/schemas';
import {
	defaultSymbolIcon,
	defaultSymbolIconStyle,
	defaultSymbolSize,
	getFontAwesomeIconForSymbolAsSVGString,
} from '../symbology/symbologyHelpers';
import { GeoJSONFeatureCollection, geoJSONFormat, setupModifyInteraction } from './olLayerManager';

// Types picked from LiteralSymbolStyle
export interface WebGLLayerSpriteSheet {
	src: string;
	textureCoord: (string | string[] | number[])[];
	size: (string | string[] | number)[];
}

const spriteSheetCanvas = document.createElement('canvas');
spriteSheetCanvas.width = 0;
spriteSheetCanvas.height = 0;
const spriteSheetCanvasContext = spriteSheetCanvas.getContext('2d');

// https://davetayls.me/blog/2013-02-11-drawing-sprites-with-canvas
export const buildSpriteSheet = async (symbols: {
	[key: string]: Partial<SymbologyProps>;
}): Promise<WebGLLayerSpriteSheet> => {
	// Before we can start using the canvas, clear everything already drawn on there
	if (spriteSheetCanvasContext !== null) {
		spriteSheetCanvasContext.clearRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height);
	}

	// ######################
	// Convert SVGs to Images
	// ######################
	const imgPromises: Promise<[img: HTMLImageElement, symbolCacheKey: string]>[] = [];

	// Add the default icon so we have something to specify as a fallback
	symbols.default_icon = {
		icon: defaultSymbolIcon,
		icon_style: defaultSymbolIconStyle,
		size: defaultSymbolSize,
	};

	// Create Image elements and use the browser to asynchronously convert the SVG to an image
	Object.keys(symbols).forEach((symbolCacheKey) => {
		const symbol = symbols[symbolCacheKey];

		const icon = getFontAwesomeIconForSymbolAsSVGString(
			symbol,
			symbol.size !== undefined ? { size: symbol.size * 2 } : undefined,
		);

		if (icon !== null) {
			imgPromises.push(
				loadImage(`data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${icon}`, symbolCacheKey),
			);
		}
	});
	// ######################
	// Convert SVGs to Images (End)
	// ######################

	// ######################
	// Determine Canvas Size
	// ######################
	const padding = 10;
	let canvasWidth = 0,
		canvasHeight = padding;

	const imgs: [img: HTMLImageElement, symbolCacheKey: string][] = [];

	const loadedSVGImages = await Promise.all(imgPromises);
	loadedSVGImages.forEach(([img, symbolCacheKey]) => {
		canvasWidth = Math.max(canvasWidth, img.width + padding + padding);
		canvasHeight = canvasHeight + padding + img.height;

		imgs.push([img, symbolCacheKey]);
	});

	spriteSheetCanvas.width = canvasWidth;
	spriteSheetCanvas.height = canvasHeight;
	// ######################
	// Determine Canvas Size (End)
	// ######################

	// ######################
	// Draw SVG Images To Canvas
	// ######################
	const spriteSheetTextureCoords: (string | string[] | number[])[] = ['match', ['get', 'symbolCacheKey']];

	const spriteSheetSizes: (string | string[] | number)[] = ['match', ['get', 'symbolCacheKey']];

	let nextCanvasPositionY = padding;

	imgs.forEach(([img, symbolCacheKey]) => {
		// Draw the SVG image data on to the canvas
		if (spriteSheetCanvasContext !== null) {
			spriteSheetCanvasContext.drawImage(
				img,
				0, // X,Y coordination positions to start extracting image data from 'img'
				0,
				img.width,
				img.height,
				padding, // X,Y coordination positions to place the top left corner of the image data on the canvas
				nextCanvasPositionY,
				img.width,
				img.height,
			);
		}

		// Create the expression for determine the texture coordinates of each sprite
		spriteSheetTextureCoords.push(symbolCacheKey);

		const topLeftX = padding;
		const topLeftY = nextCanvasPositionY;

		// Translate from image dimensions into dimensions within the canvas in a 0 - 1 range
		spriteSheetTextureCoords.push([
			// tlx, tly, brx, bry
			topLeftX / spriteSheetCanvas.width,
			topLeftY / spriteSheetCanvas.height,
			(topLeftX + img.width) / spriteSheetCanvas.width,
			(topLeftY + img.height) / spriteSheetCanvas.height,
		]);

		// Create the expression for determine the sizes of each sprite
		spriteSheetSizes.push(symbolCacheKey);
		spriteSheetSizes.push(img.width / 2);

		nextCanvasPositionY += img.height + padding;
	});

	// Use our default icon as the fallback for textures and coordinates.
	const defaultIconTextureCoordsIdx = spriteSheetTextureCoords.findIndex((item) => item === 'default_icon');
	spriteSheetTextureCoords.push(spriteSheetTextureCoords[defaultIconTextureCoordsIdx + 1]);

	const defaultIconSizeIdx = spriteSheetSizes.findIndex((item) => item === 'default_icon');
	spriteSheetSizes.push(spriteSheetSizes[defaultIconSizeIdx + 1]);
	// ######################
	// Draw SVG Images To Canvas (End)
	// ######################

	// Only used for debugging
	// spriteSheetCanvas.style.zIndex = "20000";
	// spriteSheetCanvas.style.position = "absolute";
	// spriteSheetCanvas.style.bottom = "0";
	// // context.fillStyle = "black";
	// // context.fillRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height);
	// document.body.appendChild(spriteSheetCanvas);

	return {
		src: spriteSheetCanvas.toDataURL('image/png'),
		textureCoord: spriteSheetTextureCoords,
		size: spriteSheetSizes,
	};
};

export const getNextLayerVersion = (layerVersions: number[]) => {
	if (layerVersions.length === 0) {
		return 1;
	}
	return Math.max(...layerVersions) + 1;
};

// https://stackoverflow.com/a/74026755
const loadImage = (url: string, symbolCacheKey: string) => {
	const img = new Image();
	img.src = url;

	return new Promise<[img: HTMLImageElement, symbolCacheKey: string]>((resolve, reject) => {
		img.onload = () => resolve([img, symbolCacheKey]);
		img.onerror = reject;
	});
};

export const createWebGLPointsLayer = (
	features: GeoJSONFeatureCollection,
	spriteSheet: WebGLLayerSpriteSheet | undefined,
) => {
	// Read more:
	// https://openlayers.org/en/latest/examples/webgl-points-layer.html
	// https://openlayers.org/en/latest/examples/icon-sprite-webgl.html
	// https://openlayers.org/workshop/en/webgl/animated.html
	// Soruce: https://github.com/openlayers/workshop/blob/main/src/en/examples/webgl/animated.js

	return new WebGLPointsLayer({
		source: new VectorSource({
			format: geoJSONFormat,
			features: geoJSONFormat.readFeatures(features),
		}) as VectorSource<Point>,
		// Something odd going on in the typings here, but this seems to work without issue anyway.
		style:
			spriteSheet !== undefined
				? {
						symbol: {
							symbolType: 'image',
							rotateWithView: false,
							src: spriteSheet.src,
							size: spriteSheet.size,
							textureCoord: spriteSheet.textureCoord,
						},
				  }
				: {
						symbol: {
							symbolType: 'circle',
							size: 12,
							rotateWithView: false,
						},
				  },
		properties: {
			id: 'data-layer',
		},
	});
};

export const manageWebGLPointsLayerCreation = (
	features: GeoJSONFeatureCollection,
	spriteSheet: WebGLLayerSpriteSheet | undefined,
	map: Map,
	isFeatureMovementAllowed: boolean,
	onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
	onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void,
) => {
	const vectorLayer = createWebGLPointsLayer(features, spriteSheet);
	map.addLayer(vectorLayer);

	const modify = setupModifyInteraction(
		// Not sure why this was complaining
		vectorLayer as unknown as VectorLayer<VectorSource<Geometry>>,
		onModifyInteractionStartEnd,
		onModifyInteractionAddRemoveFeature,
	);
	modify.setActive(isFeatureMovementAllowed);
	map.addInteraction(modify);

	return vectorLayer;
};

export const manageWebGLPointsLayerUpdate = (
	features: GeoJSONFeatureCollection,
	spriteSheet: WebGLLayerSpriteSheet | undefined,
	vectorLayer: WebGLPointsLayer<VectorSource<Point>>,
	map: Map,
	isFeatureMovementAllowed: boolean,
	onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
	onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void,
) => {
	// Update the existing layer with new styles and force a re-render

	// Workaround for the "Cannot read properties of null (reading 'hasRenderer')" bug
	// that comes from modify interaction.
	// Reproduce by moving a feature and keeping the cursor moving while this
	// "tear down and recreate the layer" work is happening.
	// It *seems* to all be about the new interaction that's added at the end.
	// No amount of setActive(false) and early removing of the old interaction helped.
	const workaroundModifyInteractionBugElement = document.getElementById('workaround_modify_interaction_bug');
	if (workaroundModifyInteractionBugElement !== null) {
		workaroundModifyInteractionBugElement.style.setProperty('display', 'block');
	}

	// Remove and cleanup the current layer
	map.getInteractions().forEach((interaction) => {
		if (interaction.getProperties().is_modify && map !== undefined) {
			map.removeInteraction(interaction);
		}
	});

	map.removeLayer(vectorLayer);
	vectorLayer.dispose();

	// Add the new layer
	const newVectorLayer = createWebGLPointsLayer(features, spriteSheet);
	map.addLayer(newVectorLayer);

	const modify = setupModifyInteraction(
		// Not sure why this was complaining
		newVectorLayer as unknown as VectorLayer<VectorSource<Geometry>>,
		onModifyInteractionStartEnd,
		onModifyInteractionAddRemoveFeature,
	);
	modify.setActive(isFeatureMovementAllowed);
	map.addInteraction(modify);

	if (workaroundModifyInteractionBugElement !== null) {
		// Needs to be slightly after the interaction is added to actually work.
		window.setTimeout(() => workaroundModifyInteractionBugElement.style.setProperty('display', 'none'), 250);
	}

	return newVectorLayer;
};
