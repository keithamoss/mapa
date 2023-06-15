import { RGBACSSDarkenColour, hextoRGBACSS } from '../../app/colourUtils';
import {
	IconStyle,
	getIconByName,
	getIconSVG,
	isIconStyleColoured,
	isIconStyleDuotoneOrTritone,
	isIconStyleTritone,
} from './iconsLibrary';
import {
	FontAwesomeIconSVGProps,
	defaultSymbolColour,
	defaultSymbolDarkenColourByPercentage,
	defaultSymbolIconSVG,
	defaultSymbolSecondaryColour,
	defaultSymbolTertiaryColour,
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

export const parseAndManipulateSVGIcon = (svg: string, iconProps: FontAwesomeIconSVGProps, iconStyle?: IconStyle) => {
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
	for (const pathElement of svgDOMElement.getElementsByTagName('defs')) {
		pathElement.remove();
	}

	for (const pathElement of svgDOMElement.getElementsByTagName('g')) {
		pathElement.removeAttribute('fill');
	}

	// Apply the primary colour to all path elements as a default
	// Duotone and Tritone will come through afterwards and set their own colours
	// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
	getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'primary', true).forEach((pathElement) => {
		if (isIconStyleColoured(iconStyle)) {
			pathElement.setAttribute('fill', hextoRGBACSS(pathElement.getAttribute('fill') || defaultSymbolColour));
		} else {
			// We're null checking because the FontAwesome icons don't assign 'primary' to simple icons, and it would be a waste of characters to do so.
			if (pathElement.getAttribute('class') === 'primary' || pathElement.getAttribute('class') === null) {
				pathElement.setAttribute('fill', iconProps.colour);
				pathElement.style.setProperty('opacity', `${iconProps.opacity}`);
			} else if (pathElement.getAttribute('class') === 'primary darker') {
				pathElement.setAttribute('fill', RGBACSSDarkenColour(iconProps.colour, defaultSymbolDarkenColourByPercentage));
				pathElement.style.setProperty('opacity', `${iconProps.opacity}`);
			}
		}

		pathElement.removeAttribute('data-original');
	});

	// Duotone icons only: Apply the secondary colour style properties to the secondary path elements
	if (isIconStyleDuotoneOrTritone(iconStyle)) {
		getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'secondary').forEach((pathElement) => {
			if (isIconStyleColoured(iconStyle)) {
				pathElement.setAttribute(
					'fill',
					hextoRGBACSS(pathElement.getAttribute('fill') || defaultSymbolSecondaryColour),
				);
			} else {
				if (pathElement.getAttribute('class') === 'secondary') {
					pathElement.setAttribute('fill', iconProps.secondaryColour);
				} else if (pathElement.getAttribute('class') === 'secondary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.secondaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}

				pathElement.style.setProperty('opacity', `${iconProps.secondaryOpacity}`);
			}

			pathElement.removeAttribute('data-original');
		});
	}

	// Tritone icons only: Apply the tertiary colour style properties to the tertiary path elements
	if (isIconStyleTritone(iconStyle)) {
		getSVGPathElementsByTagNameAndClassName(svgDOMElement, 'tertiary').forEach((pathElement) => {
			if (isIconStyleColoured(iconStyle)) {
				pathElement.setAttribute('fill', hextoRGBACSS(pathElement.getAttribute('fill') || defaultSymbolTertiaryColour));
			} else {
				if (pathElement.getAttribute('class') === 'tertiary') {
					pathElement.setAttribute('fill', iconProps.tertiaryColour);
				} else if (pathElement.getAttribute('class') === 'tertiary darker') {
					pathElement.setAttribute(
						'fill',
						RGBACSSDarkenColour(iconProps.tertiaryColour, defaultSymbolDarkenColourByPercentage),
					);
				}

				pathElement.style.setProperty('opacity', `${iconProps.tertiaryOpacity}`);
			}

			pathElement.removeAttribute('data-original');
		});
	}

	// Modifier icons only
	if (iconProps.modifierIcon !== '') {
		const modifierIcon = getIconByName(iconProps.modifierIcon);

		if (modifierIcon !== null) {
			// Scale all <paths> back by 80% (towards the top-left corner) to give the modifier icon room to live
			for (const pathElement of svgDOMElement.getElementsByTagName('path')) {
				setAttributesOnElement(pathElement, {
					style: 'scale: 80%;',
				});
			}

			// We need to know the size of the viewbox to place the modifier icon properly, so let's hackily parse it
			const viewBox = svgDOMElement.getAttribute('viewBox')?.split(' ');

			if (viewBox !== undefined) {
				const modifierSVG = getIconSVG(modifierIcon, 'solid') || defaultSymbolIconSVG;
				const modifierSVGDOMElement = new DOMParser().parseFromString(modifierSVG, 'image/svg+xml');

				// As a baseline, 512 dims = 250px of translation to get the modifier to roughly the bottom right-hand corner
				const translateX = 250 + (Number(viewBox[2]) - 512);
				const translateY = 250 + (Number(viewBox[3]) - 512);

				// Scale all <paths> back by 50% to make the modifier icon just the right size to sit in the bottom-right corner
				// Translate takes care of finding the precise top-left corner to place the icon in based on the dimensions of
				// the parent icon.
				for (const pathElement of modifierSVGDOMElement.getElementsByTagName('path')) {
					pathElement.setAttribute(
						'style',
						`fill: ${iconProps.modifierColour}; translate: ${translateX}px ${translateY}px; scale: 50%;`,
					);
				}

				// Place a white background circle behind the modifier icon so it's appearance is uniform
				svgDOMElement.insertAdjacentHTML(
					'beforeend',
					`<path style="fill: rgb(255, 255, 255); translate: ${translateX}px ${translateY}px; scale: 50%;" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />`,
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
