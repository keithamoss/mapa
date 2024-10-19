import type { Map } from 'ol';
import { toRadians } from 'ol/math';
import { isDevelopment } from '../../app/utils';

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
							// 30 FPS
						}, 1000 / 30);
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

		// Support almost all combinations of browsers and devices with accelerometers and magnetometers - except for iOS
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

export const setOverlayElementRotation = (
	compass: number,
	geolocationMarkerHeadingForegroundTriangleOverlayDiv: React.MutableRefObject<HTMLDivElement | undefined>,
	geolocationMarkerHeadingBackroundTriangleOverlayDiv: React.MutableRefObject<HTMLDivElement | undefined>,
) => {
	const newCompassHeadingTransform = `rotate(${compass}deg)`;

	// Presmably the browser won't repaint if we set the same transform property...

	if (geolocationMarkerHeadingForegroundTriangleOverlayDiv.current !== undefined) {
		geolocationMarkerHeadingForegroundTriangleOverlayDiv.current.style.setProperty(
			'transform',
			newCompassHeadingTransform,
		);
	}

	if (geolocationMarkerHeadingBackroundTriangleOverlayDiv.current !== undefined) {
		geolocationMarkerHeadingBackroundTriangleOverlayDiv.current.style.setProperty(
			'transform',
			newCompassHeadingTransform,
		);
	}
};

export const setMapRotation = (map: Map | undefined, compass: number) => {
	if (map !== undefined) {
		const view = map.getView();
		const compassHeadingInRadians = toRadians(compass);

		if (view !== undefined && view.getRotation() !== compassHeadingInRadians) {
			// Without the - sign here the map flips east and west.
			view.setRotation(-compassHeadingInRadians);
		}
	}
};
