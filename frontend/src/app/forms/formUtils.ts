export function stopPropagate(callback: () => void) {
	// c.f. https://github.com/react-hook-form/react-hook-form/issues/1005
	// c.f. https://github.com/react-hook-form/react-hook-form/issues/1005#issuecomment-1190389782
	//
	// Submit events still propagate to parent forms when using portals.
	// https://reactjs.org/docs/portals.html#event-bubbling-through-portals
	// Event bubbling goes through React DOM instead of HTML DOM
	// Portals don't have an effect on this one, we need to stop event propagation
	// This should be our default form handling method.
	//
	// [It seems to be the same case with MaterialUI Modals - KM]
	return (event: React.FormEvent<HTMLFormElement>) => {
		if (event) {
			// Sometimes not true, e.g. React Native
			if (typeof event.preventDefault === 'function') {
				event.preventDefault();
			}

			if (typeof event.stopPropagation === 'function') {
				// Prevent any outer forms from receiving the event too
				event.stopPropagation();
			}
		}

		callback();
	};
}
