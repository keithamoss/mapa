import { RGBACSSDarkenColour } from '../../app/colourUtils';
import { IconStyle } from './iconsLibrary';
import {
	getIconByName,
	getIconSVG,
	isCircularModifierIcon,
	isIconColourLocked,
	isIconStyleDuotoneOrTritone,
	isIconStyleTritone,
} from './iconsLibraryHelpers';
import {
	FontAwesomeIconSVGProps,
	defaultSymbolDarkenColourByPercentage,
	defaultSymbolIconSVG,
} from './symbologyHelpers';

const getSVGPathElementsByClassName = (rootElement: SVGSVGElement, className: string, allowNull = false) => {
	const elements: SVGPathElement[] = [];

	for (const element of rootElement.getElementsByTagName('path')) {
		if (
			(allowNull === true && element.getAttribute('class') === null) ||
			(element.getAttribute('class') || '').split(' ').includes(className) ||
			className === ''
		) {
			elements.push(element);
		}
	}

	return elements;
};

const setAttributesOnElement = (svg: Element, attributes: { [key: string]: string }) =>
	Object.entries(attributes).forEach(([attributeName, attributeValue]) =>
		svg.setAttribute(attributeName, attributeValue),
	);

const groupElementsTogether = (svgDOMElement: SVGSVGElement, groupStyle: string) => {
	const grpDOMElementWrapped = new DOMParser().parseFromString(
		`<div><g xmlns="http://www.w3.org/2000/svg">${svgDOMElement.innerHTML}</g></div>`,
		'image/svg+xml',
	);
	const grpDOMElement = grpDOMElementWrapped.getElementsByTagName('g')[0];

	grpDOMElement.setAttribute('style', groupStyle);

	return grpDOMElement;
};

const calculateScaleAndTranslationForSVGCircularModifierIcon = (
	originalIconViewboxWidthDimension: number,
	originalIconViewboxHeightDimension: number,
	modifierIconViewboxWidthDimension: number,
) => {
	// We want modifier icons to be 40% the size of the original icon.
	// We'll use the `scale` property to change it's size.
	const modifierIconDesiredSizeAsPercentageOfOriginalIcon = 0.4;

	// Take the largest of the dimensions to accomodate original icons that
	// have viewboxes that arent' squares.
	// This ensures that, for example, icons like salt-shaker that are tall
	// and narrow don't end up with a smaller-than-ideal modifier icon.
	// e.g. The 'place marker question mark icon' is "0 0 384 512"
	const originalIconViewboxLargestDimension = Math.max(
		originalIconViewboxWidthDimension,
		originalIconViewboxHeightDimension,
	);

	// To scale it, we need to know how much to scale the modifier
	// icon by in relation to the viewbox of the original icon.
	// The original icons can have varying viewbox sizes - anything
	// from "0 0 48 48" to "0 0 512 512" and beyond.
	// Whereas the modifier icons are usually "0 0 512 512"
	// This may change in future when we allow users to use any
	// icons as modifiers, not just the circle-* icons.

	// We need to convert that to the size of the viewbox dimensions.
	// We can think of these as pixels.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	// e.g. An original icon with a viewbox of "0 0 48 48" would lead to a
	// desired modifier icon with dimensions of (48 * 0.4) = 19.2
	const desiredModifierIconSizeInViewboxPixelDimensions =
		originalIconViewboxLargestDimension * modifierIconDesiredSizeAsPercentageOfOriginalIcon;

	// Now let's turn this into a % value we can use in the `scale` function.
	// e.g. An original icon with a desired modifier icon size of 19.2 viewbox dims
	// would lead to a desired scale of (19.2 / 512) * 100 = 3.75%
	const scale = (desiredModifierIconSizeInViewboxPixelDimensions / modifierIconViewboxWidthDimension) * 100;

	// Now we'll calculate where we need to place the top-left corner of the icon so it sits
	// neatly in the bottom-right corner of the original icon.
	// For this, we need to know the diameter of the circular modifier icon in pixels.
	// We can easily calculate this using the largest viewbox dimension (which is the input to
	// calculating scale) and working out what 40% of that is.
	const circleDiameter = originalIconViewboxLargestDimension * modifierIconDesiredSizeAsPercentageOfOriginalIcon;

	// And then the calculation to work out the X and Y is trivial, it's just subtracting
	// the diameter from the viewbox width and height of the original icon.
	const pixelOffsetFactorFromBottomRightEdge = 1;
	const translateX = originalIconViewboxWidthDimension - circleDiameter - pixelOffsetFactorFromBottomRightEdge;
	const translateY = originalIconViewboxHeightDimension - circleDiameter - pixelOffsetFactorFromBottomRightEdge;

	// Lastly, some mild (but reasonably safe) magic numbering required to ensure the background circle
	// that provides the colour for the icon is hidden behind the actual icon and doesn't peek
	// out and show it's colour around the edges.
	const scaleBackground = scale * 0.9;
	const translateXBackground = translateX + circleDiameter * 0.05;
	const translateYBackground = translateY + circleDiameter * 0.05;

	return {
		scaleIcon: scale,
		translateXIcon: translateX,
		translateYIcon: translateY,
		scaleBackground,
		translateXBackground,
		translateYBackground,
	};
};

const calculateScaleAndTranslationForSVGModifierIconBackgroundCircle = (
	originalIconViewboxWidthDimension: number,
	originalIconViewboxHeightDimension: number,
	modifierIconViewboxWidthDimension: number,
) => {
	// We want modifier icons to be 40% the size of the original icon.
	// We'll use the `scale` property to change it's size.
	const modifierIconWidthPercentage = 0.4;

	// Take the largest of the dimensions to accomodate original icons that
	// have viewboxes that arent' squares.
	// This ensures that, for example, icons like salt-shaker that are tall
	// and narrow don't end up with a smaller-than-ideal modifier icon.
	// e.g. The 'place marker question mark icon' is "0 0 384 512"
	const originalIconViewboxLargestDimension = Math.max(
		originalIconViewboxWidthDimension,
		originalIconViewboxHeightDimension,
	);

	// To scale it, we need to know how much to scale the modifier
	// icon by in relation to the viewbox of the original icon.
	// The original icons can have varying viewbox sizes - anything
	// from "0 0 48 48" to "0 0 512 512" and beyond.
	// Whereas the modifier icons are usually "0 0 512 512"
	// This may change in future when we allow users to use any
	// icons as modifiers, not just the circle-* icons.

	// We need to convert that to the size of the viewbox dimensions.
	// We can think of these as pixels.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	// e.g. An original icon with a viewbox of "0 0 48 48" would lead to a
	// desired modifier icon with dimensions of (48 * 0.4) = 19.2
	const desiredModifierIconSizeInViewboxDimensions = originalIconViewboxLargestDimension * modifierIconWidthPercentage;

	// Now let's turn this into a % value we can use in the `scale` function.
	// e.g. An original icon with a desired modifier icon size of 19.2 viewbox dims
	// would lead to a desired scale of (19.2 / 512) * 100 = 3.75%
	const scale = (desiredModifierIconSizeInViewboxDimensions / modifierIconViewboxWidthDimension) * 100;

	// Now we'll calculate where we need to place the top-left corner of the icon so it sits
	// neatly in the bottom-right corner of the original icon.
	// For this, we need to know the diameter of the circular modifier icon in pixels.
	// We can easily calculate this using the largest viewbox dimension (which is the input to
	// calculating scale) and working out what 40% of that is.
	const circleDiameter = originalIconViewboxLargestDimension * modifierIconWidthPercentage;

	// And then the calculation to work out the X and Y is trivial, it's just subtracting
	// the diameter from the viewbox width and height of the original icon.
	const pixelOffsetFactorFromBottomRightEdge = 1;
	const translateX = originalIconViewboxWidthDimension - circleDiameter - pixelOffsetFactorFromBottomRightEdge;
	const translateY = originalIconViewboxHeightDimension - circleDiameter - pixelOffsetFactorFromBottomRightEdge;

	return { scale, translateX, translateY, circleDiameter };
};

const calculateScaleAndTranslationForSVGModifierIcon = (
	translateXOfBackgroundCircle: number,
	translateYOfBackgroundCircle: number,
	modifierIconViewboxWidthDimension: number,
	modifierIconViewboxHeightDimension: number,
	backgroundCircleDiameter: number,
) => {
	// We want the modifier icon to be 60% of the size background circle so it fits nicely inside.
	const modifierIconDesiredSizeAsPercentageOfBackgroundCircleDiameter = 0.6;

	// First, we need to work out the desired width of the modifier icon
	// based on 60% of the diameter of the background circle it sits inside.
	// e.g. A circle with a diameter of 128 would lead to a
	// desired modifier icon width of (128 * 0.6) = 76.8 viewbox dims pixels
	const desiredModifierIconWidth =
		backgroundCircleDiameter * modifierIconDesiredSizeAsPercentageOfBackgroundCircleDiameter;

	// Now, for scaling, we take the largest of the dimensions to accomodate original
	// icons that have viewboxes that arent't squares.
	// e.g. The 'place marker question mark icon' is "0 0 384 512"
	const originalIconViewboxLargestDimension = Math.max(
		modifierIconViewboxWidthDimension,
		modifierIconViewboxHeightDimension,
	);

	// Now let's turn this into a % value we can use in the `scale` function.
	// e.g. An icon with a desired modifier icon width of 76.8 viewbox dims pixels
	// would lead to a desired scale of (76.8 / 512) * 100 = 15%
	const scale = (desiredModifierIconWidth / originalIconViewboxLargestDimension) * 100;

	// Lastly, now we need to work out where to position the top-left corner of the
	// modifier icon so it sits neatly centred inside the background circle in the
	// bottom-right corner of the original icon.

	// To do this, we first need to know the width and height of the modifier icon in
	// viewbox dims pixels once it has been scaled down.
	// This is a simple matter of taking the viewbox width and height of the modifier
	// icon and scaling it down.
	// e.g. A modifier icon with viewbox dims of "0 0 384 512" (salt-shaker) would have a width
	// of 384 * (15 / 100) = 57.6 viewbox dims pixels
	const modifierIconWidth = modifierIconViewboxWidthDimension * (scale / 100);
	const modifierIconHeight = modifierIconViewboxHeightDimension * (scale / 100);

	// Lastly, calculating translate X and Y position becomes a simple matter of taking the
	// top-left corner position of the background circle and adding half of the difference
	// between the diameter of the circle and the width or height of the scaled down modifier
	// icon itself.
	const translateX = translateXOfBackgroundCircle + (backgroundCircleDiameter - modifierIconWidth) / 2;
	const translateY = translateYOfBackgroundCircle + (backgroundCircleDiameter - modifierIconHeight) / 2;

	return { scale, translateX, translateY };
};

export const parseAndManipulateSVGIcon = (
	svg: string,
	iconProps: FontAwesomeIconSVGProps,
	isOriginalIconColourLocked: boolean,
	iconStyle?: IconStyle,
) => {
	// Wrapping the SVG element in a <div> let's us easily convert the DOM to a string with `.documentElement.innerHTML` later on
	const svgDOMElementWrapped = new DOMParser().parseFromString(`<div>${svg}</div>`, 'image/svg+xml');
	const svgDOMElement = svgDOMElementWrapped.getElementsByTagName('svg')[0];

	// Apply our overall icon styling and required attributes to the outer <svg> element
	setAttributesOnElement(svgDOMElement, {
		'aria-hidden': 'true',
		focusable: 'false',
		role: 'img',
		style: `background-color: ${iconProps.backgroundColour}; transform: rotate(${iconProps.rotation}deg);`,
		width: `${iconProps.width}`,
		height: `${iconProps.height}`,
	});

	// We always write the style inline on the paths, so we can delete the <defs><style>...</style></defs> element(s), if they exist
	for (const defsElement of svgDOMElement.getElementsByTagName('defs')) {
		defsElement.remove();
	}

	if (isOriginalIconColourLocked === false) {
		// Apply the primary colour to all path elements as a default
		// Duotone and Tritone will come through afterwards and set their own colours
		// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
		getSVGPathElementsByClassName(svgDOMElement, 'primary', true).forEach((pathElement) => {
			// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
			if (pathElement.getAttribute('class') === 'primary' || pathElement.getAttribute('class') === null) {
				pathElement.setAttribute('fill', iconProps.colour);
			} else if (pathElement.getAttribute('class') === 'primary darker') {
				pathElement.setAttribute('fill', RGBACSSDarkenColour(iconProps.colour, defaultSymbolDarkenColourByPercentage));
			}
		});

		// Duotone icons only: Apply the secondary colour style properties to the secondary path elements
		if (isIconStyleDuotoneOrTritone(iconStyle)) {
			getSVGPathElementsByClassName(svgDOMElement, 'secondary').forEach((pathElement) => {
				if (pathElement.getAttribute('class') === 'secondary') {
					pathElement.setAttribute('fill', iconProps.secondaryColour);
				} else if (pathElement.getAttribute('class') === 'secondary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.secondaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}
			});
		}

		// Tritone icons only: Apply the tertiary colour style properties to the tertiary path elements
		if (isIconStyleTritone(iconStyle)) {
			getSVGPathElementsByClassName(svgDOMElement, 'tertiary').forEach((pathElement) => {
				if (pathElement.getAttribute('class') === 'tertiary') {
					pathElement.setAttribute('fill', iconProps.tertiaryColour);
				} else if (pathElement.getAttribute('class') === 'tertiary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.tertiaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}
			});
		}
	}

	// Modifier icons only
	if (iconProps.modifierIcon !== '') {
		const modifierIcon = getIconByName(iconProps.modifierIcon);

		if (modifierIcon !== null) {
			// This allows us to be backwards compatible with icons defined while we only allowed circular modifier icons.
			// These never saved the modifierIconStyle as 'solid', because that was the only possible style and the user
			// didn't need to pick it.
			const modifierIconStyle =
				isCircularModifierIcon(iconProps.modifierIcon) === true || iconProps.modifierIconStyle === ''
					? 'solid'
					: iconProps.modifierIconStyle;

			// Wrapping the modifier SVG element in a <div> let's us easily access the typed SVGSVGElement object
			const modifierSVG = getIconSVG(modifierIcon, modifierIconStyle) || defaultSymbolIconSVG;
			const modifierSVGDOMElementWrapped = new DOMParser().parseFromString(
				`<div>${modifierSVG}</div>`,
				'image/svg+xml',
			);
			const modifierSVGDOMElement = modifierSVGDOMElementWrapped.getElementsByTagName('svg')[0];

			// We need to know the size of both the base and modifier icon viewboxes to place the modifier icon properly, so let's hackily parse them
			const viewbox = svgDOMElement.getAttribute('viewBox')?.split(' ');
			const modifierIconViewbox = modifierSVGDOMElement.getAttribute('viewBox')?.split(' ');

			// Errors raised here get reported in getFontAwesomeIconFromLibrary() and defaultSymbolIconSVGPreStyled is returned instead
			if (viewbox === undefined) {
				throw Error(`Unable to find a viewbox in the base icon SVG: ${JSON.stringify(iconProps)} // ${svg}`);
			}

			if (modifierIconViewbox === undefined) {
				throw Error(
					`Unable to find a viewbox in the modifier icon SVG: ${JSON.stringify(iconProps)} // ${modifierSVG}`,
				);
			}

			// Shrink the original icon slightly by enclosing all of its SVG elements in a <g></g> element
			svgDOMElement.replaceChildren(groupElementsTogether(svgDOMElement, 'scale: 80%'));

			// Gather some important information we'll need to work out how to position the modifier icon.
			const originalIconViewboxWidth = parseInt(viewbox[2]);
			const originalIconViewboxHeight = parseInt(viewbox[3]);
			const modifierIconViewboxWidth = parseInt(modifierIconViewbox[2]);
			const modifierIconViewboxHeight = parseInt(modifierIconViewbox[3]);
			const modifierIconCircleBackgroundViewboxWidthAndHeight = 512;

			// ######################
			// Circular Modifier Icons
			// This handles the small subset of the original regular circular modifier icons
			// ######################
			if (isCircularModifierIcon(iconProps.modifierIcon) === true) {
				// const originalIconViewboxWidth = parseInt(viewbox[2]);
				// const originalIconViewboxHeight = parseInt(viewbox[3]);
				// const modifierIconViewboxWidth = parseInt(modifierIconViewbox[2]);

				const {
					scaleIcon,
					translateXIcon,
					translateYIcon,
					scaleBackground,
					translateXBackground,
					translateYBackground,
				} = calculateScaleAndTranslationForSVGCircularModifierIcon(
					originalIconViewboxWidth,
					originalIconViewboxHeight,
					modifierIconViewboxWidth,
				);

				// Scale all <paths> to make the modifier icon just the right size to sit in the bottom-right corner.
				// Translate takes care of placing the top-left corner of the modifier icon so it sits neatly in the
				// bottom right-hand corner of the original icon.
				// Note: We use modifierCircleColour because the paths in the circular modifier icons describe the circle,
				// and leave a transparent cut out for the shape of the icon.
				getSVGPathElementsByClassName(modifierSVGDOMElement, 'primary', true).forEach((pathElement) => {
					pathElement.setAttribute(
						'style',
						`fill: ${iconProps.modifierCircleColour}; translate: ${translateXIcon}px ${translateYIcon}px; scale: ${scaleIcon}%;`,
					);
				});

				// Place a background circle behind the modifier icon so we can colour the icon.
				// This is a little odd, but it works because the special circular modifier icons
				// have a transparent cut out for the icon shape, not an actual path.
				svgDOMElement.insertAdjacentHTML(
					'beforeend',
					`<path style="fill: ${iconProps.modifierColour}; translate: ${translateXBackground}px ${translateYBackground}px; scale: ${scaleBackground}%;" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />`,
				);

				// Lastly, insert our modifier icon path elements into the parent icon
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					svgDOMElement.insertAdjacentElement('beforeend', pathElement);
				}
			} else {
				// ######################
				// Regular Modifier Icons
				// This handles all other icons
				// ######################
				const {
					scale: backgroundCircleScale,
					translateX: backgroundCircleTranslateX,
					translateY: backgroundCircleTranslateY,
					circleDiameter: backgroundCircleDiameter,
				} = calculateScaleAndTranslationForSVGModifierIconBackgroundCircle(
					originalIconViewboxWidth,
					originalIconViewboxHeight,
					modifierIconCircleBackgroundViewboxWidthAndHeight,
				);

				const { scale, translateX, translateY } = calculateScaleAndTranslationForSVGModifierIcon(
					backgroundCircleTranslateX,
					backgroundCircleTranslateY,
					modifierIconViewboxWidth,
					modifierIconViewboxHeight,
					backgroundCircleDiameter,
				);

				// Place the background circle that sits behind the modifier icon
				// The viewbox on this is considered to be '0 0 512 512'
				// Ref. modifierIconCircleBackgroundViewboxWidthAndHeight
				svgDOMElement.insertAdjacentHTML(
					'beforeend',
					`<path style="fill: ${iconProps.modifierCircleColour}; translate: ${backgroundCircleTranslateX}px ${backgroundCircleTranslateY}px; scale: ${backgroundCircleScale}%;" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />`,
				);

				// Apply the desired colours to the modifier icon if it's not colour-locked
				if (isIconColourLocked(modifierIcon, modifierIconStyle) === false) {
					getSVGPathElementsByClassName(modifierSVGDOMElement, 'primary', true).forEach((pathElement) =>
						pathElement.setAttribute('style', `fill: ${iconProps.modifierColour};`),
					);

					// Duotone icons only: Apply the secondary colour style properties to the secondary path elements
					if (isIconStyleDuotoneOrTritone(modifierIconStyle)) {
						getSVGPathElementsByClassName(modifierSVGDOMElement, 'secondary').forEach((pathElement) => {
							if (pathElement.getAttribute('class') === 'secondary') {
								pathElement.setAttribute('style', `fill: ${iconProps.modifierSecondaryColour};`);
							} else if (pathElement.getAttribute('class') === 'secondary darker') {
								pathElement.setAttribute(
									'style',
									`fill: ${RGBACSSDarkenColour(
										iconProps.modifierSecondaryColour,
										defaultSymbolDarkenColourByPercentage,
									)};`,
								);
							}
						});
					}
				}

				// Enclose all of the modifier icon SVG elements in a <g></g> element
				svgDOMElement.insertAdjacentElement(
					'beforeend',
					groupElementsTogether(modifierSVGDOMElement, `translate: ${translateX}px ${translateY}px; scale: ${scale}%;`),
				);
			}
		}
	}

	return `${svgDOMElementWrapped.documentElement.innerHTML}`;
};
