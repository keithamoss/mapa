import { Map } from 'ol';
import { isDevelopment } from '../../app/utils';
import { degreesToRadians } from './olMapHelpers';

export enum MapHeadingStatus {
	Off = 'Off',
	On = 'On',
	OnAndMapFollowing = 'OnAndMapFollowing',
	Unsupported = 'Unsupported',
	Denied = 'Denied',
}

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
	requestPermission?: () => Promise<'granted' | 'denied'>;
	webkitCompassHeading?: number;
}

// https://stackoverflow.com/a/73369838/7368493
export const isDeviceOrientationPermissionRequired = () =>
	typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission === 'function';

export const isSimulatingDeviceOrientationInDevelopment = () =>
	isDevelopment() === true && isDeviceOrientationPermissionRequired() === false;
// export const isSimulatingDeviceOrientationInDevelopment = () => false;

// export const detectIfDeviceOrientationIsProbablySupported = (
// 	setIsSupported: React.Dispatch<React.SetStateAction<boolean | undefined>>,
// ) => {
// 	// Let's try and determine if the Device Orientation events are both (a) supported in this browser and (b) the device this is on supports providing absolute orientation (i.e. in the frame of reference of the Earth's coordinate system)

// 	// Firstly, if the browser doesn't support Device Orientation, then we're a clear no
// 	if (!window.DeviceOrientationEvent) {
// 		setIsSupported(false);
// 		return;
// 	}

// 	// If we want to simulate Device Orientation in dev, just say we support the events
// 	if (isSimulatingDeviceOrientationInDevelopment() === true) {
// 		setIsSupported(true);
// 		return;
// 	}

// 	// Now let's sniff and see if the device running this browser actually supports giving us an absolute compass orientation
// 	const abortControllerAbsolute = new AbortController();
// 	const abortControllerWebkit = new AbortController();

// 	const timeoutId = window.setTimeout(() => {
// 		console.log('Gave up waiting');
// 		abortControllerAbsolute.abort();
// 		abortControllerWebkit.abort();

// 		// This is where the 'Probably' in the function name comes in!
// 		// 1. We're Safari on an iOS device and the user hasn't granted permissions yet (they need to take an action before we can request permissions)
// 		// 2. We're Safari on iOS and the user has denied permissions. Alas, there's no way we can see if the user has denied permissions without having them take an action and requesting permissions. The closest we can get is running the two listeners below and seeing if we get a resut.
// 		//
// 		// So in these cases we set 'undefined' so we can react accordingly on the map, have it set the control to off, and then request permissions when the user taps on it
// 		setIsSupported(undefined);
// 	}, 1000);

// 	window.addEventListener(
// 		'deviceorientationabsolute',
// 		(e: DeviceOrientationEvent) => {
// 			console.log('Sniff AbsoluteListener', e);

// 			window.clearInterval(timeoutId);
// 			abortControllerWebkit.abort();

// 			if (
// 				e.absolute === true &&
// 				Number.isNaN(e.alpha) === false &&
// 				Number.isNaN(e.beta) === false &&
// 				Number.isNaN(e.gamma) === false
// 			) {
// 				setIsSupported(true);
// 			}
// 			setIsSupported(false);
// 		},
// 		{
// 			signal: abortControllerAbsolute.signal,
// 			once: true,
// 		},
// 	);

// 	window.addEventListener(
// 		'deviceorientation',
// 		(e: DeviceOrientationEventiOS) => {
// 			console.log('Sniff WebkitListener', e);

// 			window.clearInterval(timeoutId);
// 			abortControllerAbsolute.abort();

// 			if (
// 				e.webkitCompassHeading !== undefined &&
// 				e.webkitCompassHeading !== null &&
// 				Number.isNaN(e.webkitCompassHeading) === true
// 			) {
// 				setIsSupported(true);
// 			}
// 			setIsSupported(false);
// 		},
// 		{
// 			signal: abortControllerWebkit.signal,
// 			once: true,
// 		},
// 	);
// };

export const requestDeviceOrientationPermissionAndOrAddListener = async (
	deviceOrientationListenerManagerRef: React.MutableRefObject<DeviceOrientationListenerManager>,
	deviceOrientationCompassHeadingRef: React.MutableRefObject<number | undefined>,
	isFollowingHeadingStatusRef: React.MutableRefObject<MapHeadingStatus>,
	setIsFollowingHeadingStatus: React.Dispatch<React.SetStateAction<MapHeadingStatus>>,
) => {
	// The first time a user on an iOS device wants to use DeviceOrientation permisisons we need them to take an action (e.g. clicking a button) to trigger a permissions request.
	// Once permissions are granted we can just call requestPermission() without user interaction.
	if (isDeviceOrientationPermissionRequired() === true) {
		const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;

		if (requestPermission !== undefined) {
			try {
				const response = await requestPermission();
				if (response === 'granted') {
					deviceOrientationListenerManagerRef.current.addListener(
						deviceOrientationCompassHeadingRef,
						isFollowingHeadingStatusRef,
						setIsFollowingHeadingStatus,
					);
				} else {
					setIsFollowingHeadingStatus(MapHeadingStatus.Denied);
				}
			} catch (error) {
				// Requesting device orientation access requires a user gesture to prompt
				setIsFollowingHeadingStatus(MapHeadingStatus.Off);
			}
		}
	} else {
		// For all non-iOS devices, we can just go ahead and attach the listener as permissions aren't required.
		deviceOrientationListenerManagerRef.current.addListener(
			deviceOrientationCompassHeadingRef,
			isFollowingHeadingStatusRef,
			setIsFollowingHeadingStatus,
		);
	}
};

// For all non-iOS devices that support the standard 'deviceorientationabsolute' event
// Ref: https://stackoverflow.com/a/75792197/7368493
const deviceOrientationAbsoluteListener =
	(
		deviceOrientationCompassHeadingRef: React.MutableRefObject<number | undefined>,
		isFollowingHeadingStatusRef: React.MutableRefObject<MapHeadingStatus>,
		setIsFollowingHeadingStatus: React.Dispatch<React.SetStateAction<MapHeadingStatus>>,
	) =>
	(e: DeviceOrientationEvent) => {
		if (e.absolute === false || e.alpha === null || e.beta === null || e.gamma === null) {
			setIsFollowingHeadingStatus(MapHeadingStatus.Unsupported);
			return;
		}

		if (
			isFollowingHeadingStatusRef.current === MapHeadingStatus.Off ||
			isFollowingHeadingStatusRef.current === MapHeadingStatus.On ||
			isFollowingHeadingStatusRef.current === MapHeadingStatus.OnAndMapFollowing
		) {
			if (isFollowingHeadingStatusRef.current === MapHeadingStatus.Off) {
				setIsFollowingHeadingStatus(MapHeadingStatus.On);
			}

			// Calculate compass heading from absolute alpha, beta, and gamma
			let compass = -(e.alpha + (e.beta * e.gamma) / 90);
			compass -= Math.floor(compass / 360) * 360; // Wrap into range 0 to 360

			deviceOrientationCompassHeadingRef.current = compass;
		}
	};

// For all Safari, and all other Webkit-based browsers, on iOS because who the fuck needs to follow web standards, eh Apple?
// Ref: https://stackoverflow.com/a/75792197/7368493
const deviceOrientationWebkitListener =
	(
		deviceOrientationCompassHeadingRef: React.MutableRefObject<number | undefined>,
		isFollowingHeadingStatusRef: React.MutableRefObject<MapHeadingStatus>,
		setIsFollowingHeadingStatus: React.Dispatch<React.SetStateAction<MapHeadingStatus>>,
	) =>
	(e: DeviceOrientationEvent) => {
		const compass = (e as unknown as DeviceOrientationEventiOS).webkitCompassHeading;

		if (compass === undefined || Number.isNaN(compass) === true) {
			setIsFollowingHeadingStatus(MapHeadingStatus.Unsupported);
			return;
		}

		if (
			isFollowingHeadingStatusRef.current === MapHeadingStatus.Off ||
			isFollowingHeadingStatusRef.current === MapHeadingStatus.On ||
			isFollowingHeadingStatusRef.current === MapHeadingStatus.OnAndMapFollowing
		) {
			if (isFollowingHeadingStatusRef.current === MapHeadingStatus.Off) {
				setIsFollowingHeadingStatus(MapHeadingStatus.On);
			}

			deviceOrientationCompassHeadingRef.current = compass;
		}
	};

export class DeviceOrientationListenerManager {
	public abortController: AbortController | undefined = undefined;

	public developmentModeIntervalId: number | undefined = undefined;

	addListener(
		this: DeviceOrientationListenerManager,
		deviceOrientationCompassHeadingRef: React.MutableRefObject<number | undefined>,
		isFollowingHeadingStatusRef: React.MutableRefObject<MapHeadingStatus>,
		setIsFollowingHeadingStatus: React.Dispatch<React.SetStateAction<MapHeadingStatus>>,
	) {
		// Just in case. Not sure this can ever really happen?
		this.removeListener();

		if (isSimulatingDeviceOrientationInDevelopment() === true) {
			setIsFollowingHeadingStatus(MapHeadingStatus.On);

			import('./deviceOrientationDebugEvents').then(
				(module) => {
					if (typeof module.getDebugEvents === 'function') {
						setIsFollowingHeadingStatus(MapHeadingStatus.On);

						let debugEvents = module.getDebugEvents();
						// Allows for the component to render twice and for those intervals to all be cleaned up.
						// Currently this only affects dev, but future React changes may rely on this behaviour.
						if (this.developmentModeIntervalId !== undefined) {
							window.clearInterval(this.developmentModeIntervalId);
						}

						this.developmentModeIntervalId = window.setInterval(() => {
							const [first, ...rest] = debugEvents;
							debugEvents = [...rest, first];

							deviceOrientationCompassHeadingRef.current = first;
							// 60 FPS
						}, 1000 / 60);
					}
				},
				() => {},
			);

			return;
		}

		if (!window.DeviceOrientationEvent) {
			setIsFollowingHeadingStatus(MapHeadingStatus.Unsupported);
			return;
		}

		// Support almost all combinations of browsers and devices with gyroscopes - except for iOS
		if ('ondeviceorientationabsolute' in window) {
			this.abortController = new AbortController();

			window.addEventListener(
				'deviceorientationabsolute',
				deviceOrientationAbsoluteListener(
					deviceOrientationCompassHeadingRef,
					isFollowingHeadingStatusRef,
					setIsFollowingHeadingStatus,
				),
				{
					signal: this.abortController.signal,
				},
			);

			return;
		}

		// Support Safari on iOS: Thanks, Apple! Who the fuck needs to follow standards anyway?
		if ('ondeviceorientation' in window) {
			this.abortController = new AbortController();

			// Without this casting it thinks `window` is of type 'never' due to the preceeding if statement.
			// Not sure why, but whatevs.
			(window as Window & typeof globalThis).addEventListener(
				'deviceorientation',
				deviceOrientationWebkitListener(
					deviceOrientationCompassHeadingRef,
					isFollowingHeadingStatusRef,
					setIsFollowingHeadingStatus,
				),
				{
					signal: this.abortController.signal,
				},
			);

			return;
		}

		// And if somehow we fall through this far then we're probably unsupported
		setIsFollowingHeadingStatus(MapHeadingStatus.Unsupported);
	}

	removeListener() {
		if (this.abortController !== undefined) {
			this.abortController.abort();
			this.abortController = undefined;
		}

		if (this.developmentModeIntervalId !== undefined) {
			window.clearInterval(this.developmentModeIntervalId);
			this.developmentModeIntervalId = undefined;
		}
	}
}

export const setOverlayElementRotation = (compass: number) => {
	const overlayContainer = document.getElementsByClassName('ol-overlaycontainer');
	const firstOverlayContainer = overlayContainer.item(0);

	if (firstOverlayContainer !== null) {
		const div = firstOverlayContainer as HTMLDivElement;
		const currentCompassHeadingTransform = div.style.getPropertyValue('transform');

		const newCompassHeadingTransform = `rotate(${compass}deg)`;

		if (newCompassHeadingTransform !== currentCompassHeadingTransform) {
			div.style.setProperty('transform', newCompassHeadingTransform);
		}
	}
};

export const setMapRotation = (map: Map | undefined, compass: number) => {
	if (map !== undefined) {
		const view = map.getView();
		const compassHeadingInRadians = degreesToRadians(compass);
		if (view !== undefined && view.getRotation() !== compassHeadingInRadians) {
			view.setRotation(compassHeadingInRadians);
		}
	}
};
