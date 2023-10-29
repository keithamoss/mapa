import { RGBACSSDarkenColour } from '../../app/colourUtils';
import {
	IconStyle,
	getIconByName,
	getIconSVG,
	getModifierIconNames,
	isIconStyleDuotoneOrTritone,
	isIconStyleTritone,
} from './iconsLibrary';
import {
	FontAwesomeIconSVGProps,
	defaultSymbolDarkenColourByPercentage,
	defaultSymbolIconSVG,
} from './symbologyHelpers';

export const getSVGPathElementsByTagNameAndClassName = (
	rootElement: SVGSVGElement,
	className: string,
	allowNull = false,
) => {
	const elements: SVGPathElement[] = [];

	for (const element of rootElement.getElementsByTagName('path')) {
		if (
			(allowNull === true && element.getAttribute('class') === null) ||
			(element.getAttribute('class') || '').split(' ').includes(className)
		) {
			elements.push(element);
		}
	}

	return elements;
};

export const setAttributesOnElement = (svg: Element, attributes: { [key: string]: string }) =>
	Object.entries(attributes).forEach(([attributeName, attributeValue]) =>
		svg.setAttribute(attributeName, attributeValue),
	);

const calculateScaleAndTranslationForSVGCircularModifierIcon = (
	originalIconViewboxWidthDimension: number,
	originalIconViewboxHeightDimension: number,
	modifierIconViewboxWidthDimension: number,
) => {
	// We want modifier icons to be 40% the size of the original icon.
	// We'll use the `scale` property to change it's size.
	const modifierIconWidthPercentage = 0.4;

	// Take the largest of the dimensions to accomodate original icons that
	// have viewboxes that arent't squares.
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
	// icons as modifers, not just the circle-* icons.

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

	// Lastly, now we need to work out where to position the top-left corner of the
	// modifier icon so it sits neatly in the bottom-right corner of the original icon.
	// Since the modifier icons are modifierIconWidthPercentage% of the original, the
	// offset just becomes 100% - modifierIconWidthPercentage.
	// e.g. If we want to scale the modifier to 40%, then logically the offset value is 60%.
	const modifierIconPositionOffsetPercentage = 1 - modifierIconWidthPercentage;

	const translateX = originalIconViewboxWidthDimension * modifierIconPositionOffsetPercentage;
	const translateY = originalIconViewboxHeightDimension * modifierIconPositionOffsetPercentage;

	return { scale, translateX, translateY };
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
	// have viewboxes that arent't squares.
	// e.g. The 'place marker question mark icon' is "0 0 384 512"
	const originalIconViewboxLargestDimension = Math.max(
		originalIconViewboxWidthDimension,
		originalIconViewboxHeightDimension,
	);
	// If we based it on the midpoint between the w and h...
	// const originalIconViewboxLargestDimension = 544;

	// To scale it, we need to know how much to scale the modifier
	// icon by in relation to the viewbox of the original icon.
	// The original icons can have varying viewbox sizes - anything
	// from "0 0 48 48" to "0 0 512 512" and beyond.
	// Whereas the modifier icons are usually "0 0 512 512"
	// This may change in future when we allow users to use any
	// icons as modifers, not just the circle-* icons.

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

	// Lastly, now we need to work out where to position the top-left corner of the
	// background circle is so it sits neatly in the bottom-right corner of the original icon.
	// Since the circles are modifierIconWidthPercentage% of the original, the
	// offset just becomes 100% - modifierIconWidthPercentage.
	// e.g. If we want to scale the modifier to 40%, then logically the offset value is 60%.
	const modifierIconPositionOffsetPercentage = 1 - modifierIconWidthPercentage;

	const translateX = originalIconViewboxWidthDimension * modifierIconPositionOffsetPercentage;

	// But, we do need to account for the width and height of the original icon being different.
	// First, we work out the difference between the viewbox width and height of the original icon.
	// e.g. A viewbox of '0 0 576 512' would give us a difference of
	// 576 - 512 = 64 pixels
	const originalIconViewboxDimensionDifference = Math.abs(
		originalIconViewboxWidthDimension - originalIconViewboxHeightDimension,
	);

	// Now we need to scale that difference in line with the desiered scale of the icon
	// e.g. Where we wanted a circle that's 40% of the original icon, the scale of that
	// ended up being 45%
	// And we use some magic and divide the desired scale by 4 for some reason that made sense at the time but we've now forgotten!
	// (64 * 45%) / 4 = 7.2
	const scalingMagicNumber = scale / 100 / 4;
	const originalIconViewboxDimensionDifferenceScaledMagicNumber =
		originalIconViewboxDimensionDifference * scalingMagicNumber;

	// Hmm...we did briefly have the `1` in modifierIconPositionOffsetPercentage set to 0.925 (1 - 0.925 = 7.2)
	// Why was that?
	// Maybe that explains the magic number?

	const translateY =
		originalIconViewboxHeightDimension * modifierIconPositionOffsetPercentage +
		originalIconViewboxDimensionDifferenceScaledMagicNumber;

	return { scale, translateX, translateY };
};

const calculateScaleAndTranslationForSVGModifierIcon = (
	originalIconViewboxWidthDimension: number,
	originalIconViewboxHeightDimension: number,
	translateXOfBackgroundCircle: number,
	translateYOfBackgroundCircle: number,
	modifierIconViewboxWidthDimension: number,
	modifierIconViewboxHeightDimension: number,
) => {
	// We want modifier icons to be 25% the size of the original icon.
	// We'll use the `scale` property to change it's size.
	const modifierIconWidthPercentage = 0.25;

	// To scale it, we need to know how much to scale the modifier
	// icon by in relation to the viewbox of the original icon.
	// All icons can have varying viewbox sizes - anything
	// from "0 0 48 48" to "0 0 512 512" and beyond.
	// They can also have widths that are different to heights.

	// We need to convert that to the size of the viewbox dimensions.
	// We can think of these as pixels.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	// e.g. An original icon with a viewbox of "0 0 48 48" would lead to a
	// desired modifier icon with dimensions of (48 * 0.25) = 12
	// We always use the width of the original icon as the input for calculating
	// scale as width is usually the dominant dimension.
	const desiredModifierIconSizeInViewboxDimensions = originalIconViewboxWidthDimension * modifierIconWidthPercentage;

	// Now let's turn this into a % value we can use in the `scale` function.
	// e.g. An original icon with a desired modifier icon size of 12 viewbox dims
	// would lead to a desired scale of (12 / 512) * 100 = 2.34375%
	const scale =
		(desiredModifierIconSizeInViewboxDimensions /
			Math.max(modifierIconViewboxWidthDimension, modifierIconViewboxHeightDimension)) *
		100;

	// Lastly, now we need to work out where to position the top-left corner of the
	// modifier icon so it sits neatly centred inside the background circle in the
	// bottom - right corner of the original icon.

	// Since the modifier icons are modifierIconWidthPercentage% of the original, the
	// offset just becomes 100% - modifierIconWidthPercentage.
	// e.g. If we want to scale the modifier to 40%, then logically the offset value is 60%.

	// This starts with working out the diameter of the background circle based on
	// subtracting its translateX coordinate from the total width of the original icon.
	// e.g. A background circle with a translateX of 345.6 pixels on an original icon
	// that's 576 wide would give us a background circle diameter of (576 - 345.6) = 230.4
	const backgroundCircleDiameter = originalIconViewboxWidthDimension - translateXOfBackgroundCircle;

	// Now that we know the diameter of the background circle ...

	// Now we can work out how wide the modifier icon is by taking its own viewbox width and
	// scaling it in line with our desired scale factor.
	// e.g. A modifier icon that's 384 pixels wide using a scale factor of 28.125% would be
	// 384 * 28.125% = 108
	const modifierIconWidth = modifierIconViewboxWidthDimension * (scale / 100);

	// Lastly, we can then work out the translateX coordiante for the modifier icon by
	// taking the translateX coordinate of the background circle and adding
	// half the difference between the diameter of the circle and the width of the modifier icon.
	// e.g. A circle positioned at translateX coordinate 345.6, with a diameter of 230.4 pixels, and
	// with a modifier icon that's 108 pixels wide would be
	// 345.6 + ((230.4 - 108) / 2) = 406.8 translateX coordinate
	const translateX = translateXOfBackgroundCircle + (backgroundCircleDiameter - modifierIconWidth) / 2;

	// Then we just repeat the same logic to work out the translateY coordinate
	const modifierIconHeight = modifierIconViewboxHeightDimension * (scale / 100);
	const translateY = translateYOfBackgroundCircle + (backgroundCircleDiameter - modifierIconHeight) / 2;

	return { scale, translateX, translateY };
};

export const parseAndManipulateSVGIcon = (
	svg: string,
	iconProps: FontAwesomeIconSVGProps,
	isIconColourLocked: boolean,
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

	if (isIconColourLocked === false) {
		// Apply the primary colour to all path elements as a default
		// Duotone and Tritone will come through afterwards and set their own colours
		// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
		getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'primary', true).forEach((pathElement) => {
			// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
			if (pathElement.getAttribute('class') === 'primary' || pathElement.getAttribute('class') === null) {
				pathElement.setAttribute('fill', iconProps.colour);
				pathElement.style.setProperty('opacity', `${iconProps.opacity}`);
			} else if (pathElement.getAttribute('class') === 'primary darker') {
				pathElement.setAttribute('fill', RGBACSSDarkenColour(iconProps.colour, defaultSymbolDarkenColourByPercentage));
				pathElement.style.setProperty('opacity', `${iconProps.opacity}`);
			}

			pathElement.removeAttribute('data-original');
		});

		// Duotone icons only: Apply the secondary colour style properties to the secondary path elements
		if (isIconStyleDuotoneOrTritone(iconStyle)) {
			getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'secondary').forEach((pathElement) => {
				if (pathElement.getAttribute('class') === 'secondary') {
					pathElement.setAttribute('fill', iconProps.secondaryColour);
				} else if (pathElement.getAttribute('class') === 'secondary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.secondaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}

				pathElement.style.setProperty('opacity', `${iconProps.secondaryOpacity}`);

				pathElement.removeAttribute('data-original');
			});
		}

		// Tritone icons only: Apply the tertiary colour style properties to the tertiary path elements
		if (isIconStyleTritone(iconStyle)) {
			getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'tertiary').forEach((pathElement) => {
				if (pathElement.getAttribute('class') === 'tertiary') {
					pathElement.setAttribute('fill', iconProps.tertiaryColour);
				} else if (pathElement.getAttribute('class') === 'tertiary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.tertiaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}

				pathElement.style.setProperty('opacity', `${iconProps.tertiaryOpacity}`);

				pathElement.removeAttribute('data-original');
			});
		}
	}

	// Modifier icons only
	if (iconProps.modifierIcon !== '') {
		const modifierIcon = getIconByName(iconProps.modifierIcon);

		if (modifierIcon !== null) {
			// Wrapping the modifier SVG element in a <div> let's us easily access the typed SVGSVGElement object
			const modifierSVG = getIconSVG(modifierIcon, 'solid') || defaultSymbolIconSVG;
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
			const group = svgDOMElementWrapped.createElementNS('http://www.w3.org/2000/svg', 'g');
			group.setAttribute('style', 'scale: 80%');

			const allTagsInSVGDOMElement = svgDOMElement.getElementsByTagName('*');
			for (const element of allTagsInSVGDOMElement) {
				group.appendChild(element);
			}

			// Now we can safely remove all of the elements that are grouped together...
			for (const element of allTagsInSVGDOMElement) {
				element.remove();
			}

			// ...and insert our new group back into the SVG
			svgDOMElement.append(group);

			const originalIconViewboxWidth = parseInt(viewbox[2]);
			const originalIconViewboxHeight = parseInt(viewbox[3]);
			const modifierIconViewboxWidth = parseInt(modifierIconViewbox[2]);
			const modifierIconViewboxHeight = parseInt(modifierIconViewbox[3]);
			const modifierIconCircleBackgroundViewboxWidthAndHeight = 512;

			// This handles the small subset of the original regular circular modifier icons
			if (getModifierIconNames().includes(iconProps.modifierIcon) === true) {
				// NOTE: We assume the viewbox width and height of the modifier icon are the same (i.e. they're squares).
				// This is a safe assumption (...for now!)
				const originalIconViewboxWidth = parseInt(viewbox[2]);
				const originalIconViewboxHeight = parseInt(viewbox[3]);
				const modifierIconViewboxWidth = parseInt(modifierIconViewbox[2]);

				const { scale, translateX, translateY } = calculateScaleAndTranslationForSVGCircularModifierIcon(
					originalIconViewboxWidth,
					originalIconViewboxHeight,
					modifierIconViewboxWidth,
				);

				// Scale all <paths> to make the modifier icon just the right size to sit in the bottom-right corner.
				// Translate takes care of placing the top-left corner of the modifier icon so it sits neatly in the
				// bottom right-hand corner of the original icon.
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					pathElement.setAttribute(
						'style',
						`fill: ${iconProps.modifierColour}; translate: ${translateX}px ${translateY}px; scale: ${scale}%;`,
					);
				}

				// Place a white background circle behind the modifier icon so it's appearance is uniform
				svgDOMElement.insertAdjacentHTML(
					'beforeend',
					`<path style="fill: rgb(255, 255, 255); translate: ${translateX}px ${translateY}px; scale: ${scale}%;" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />`,
				);

				// Lastly, insert our modifier icon path elements into the parent icon
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					svgDOMElement.insertAdjacentElement('beforeend', pathElement);
				}
			} else {
				// And this handles the rest of the icons that need a different treatment
				const {
					scale: backgroundCircleScale,
					translateX: backgroundCircleTranslateX,
					translateY: backgroundCircleTranslateY,
				} = calculateScaleAndTranslationForSVGModifierIconBackgroundCircle(
					originalIconViewboxWidth,
					originalIconViewboxHeight,
					modifierIconCircleBackgroundViewboxWidthAndHeight,
				);

				const { scale, translateX, translateY } = calculateScaleAndTranslationForSVGModifierIcon(
					originalIconViewboxWidth,
					originalIconViewboxHeight,
					backgroundCircleTranslateX,
					backgroundCircleTranslateY,
					modifierIconViewboxWidth,
					modifierIconViewboxHeight,
				);

				// Scale all <paths> to make the modifier icon just the right size to sit in the bottom-right corner.
				// Translate takes care of placing the top-left corner of the modifier icon so it sits neatly in the
				// bottom right-hand corner of the original icon.
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					pathElement.setAttribute(
						'style',
						`fill: ${iconProps.modifierColour}; translate: ${translateX}px ${translateY}px; scale: ${scale}%;`,
					);
				}

				// Place the background circle that sits behind the modifier icon
				// The viewbox on this is considered to be '0 0 512 512'
				// Ref. modifierIconCircleBackgroundViewboxWidthAndHeight
				svgDOMElement.insertAdjacentHTML(
					'beforeend',
					`<path style="fill: rgb(0, 0, 0); translate: ${backgroundCircleTranslateX}px ${backgroundCircleTranslateY}px; scale: ${backgroundCircleScale}%;" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />`,
				);

				// Lastly, insert our modifier icon path elements into the parent icon
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					svgDOMElement.insertAdjacentElement('beforeend', pathElement);
				}
			}
		}
	}

	return `${svgDOMElementWrapped.documentElement.innerHTML}`;
};
