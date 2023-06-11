import { IconFamily, getIconByName, getIconSVG } from './font-awesome/fontAwesome';
import { FontAwesomeIconSVGProps, defaultSymbolIconSVG } from './symbologyHelpers';

export const setAttributesOnElement = (svg: Element, attributes: { [key: string]: string }) =>
	Object.entries(attributes).forEach(([attributeName, attributeValue]) =>
		svg.setAttribute(attributeName, attributeValue),
	);

export const parseAndManipulateSVGIcon = (svg: string, iconProps: FontAwesomeIconSVGProps, iconFamily?: IconFamily) => {
	// Wrapping the SVG element in a <div> let's us easily convert the DOM to a string with `.documentElement.innerHTML` later on
	const svgDOMElementWrapped = new DOMParser().parseFromString(`<div>${svg}</div>`, 'image/svg+xml');
	const svgDOMElement = svgDOMElementWrapped.getElementsByTagName('svg')[0];

	// Apply our overall icon styling and required attributes to the outer <svg> element
	setAttributesOnElement(svgDOMElement, {
		'aria-hidden': 'true',
		focusable: 'false',
		role: 'img',
		style: `background-color: ${iconProps.backgroundColour}; transform: rotate(${iconProps.rotation}deg);`,
		color: iconProps.colour,
		width: `${iconProps.width}`,
		height: `${iconProps.height}`,
	});

	// We always write the style inline on the paths, so we can delete the <defs><style>...</style></defs> element(s), if they exist
	for (const pathElement of svgDOMElement.getElementsByTagName('defs')) {
		pathElement.remove();
	}

	// Apply the primary colour to the first path element
	// @TODO: Don't assume it's always only the first path element that needs the primary colour applied
	const firstPathElement = svgDOMElement.getElementsByTagName('path')[0];
	firstPathElement.setAttribute('fill', 'currentColor');

	// Duotone icons only: Apply the secondary colour style properties to the secondary path elements
	if (iconFamily === 'duotone') {
		for (const pathElement of svgDOMElement.getElementsByTagName('path')) {
			if (pathElement.getAttribute('class') === 'fa-secondary') {
				pathElement.setAttribute('fill', iconProps.secondaryColour);
				pathElement.style.setProperty('opacity', `${iconProps.secondaryOpacity}`);
			}
		}
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
				const modifierSVG = getIconSVG(modifierIcon, 'classic', 'solid') || defaultSymbolIconSVG;
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
