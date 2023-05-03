import { useEffect, useMemo, useState } from "react";

export interface UsePosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading: string;
  timestamp: any;
  error: any;
}

const defaultSettings = {
  enableHighAccuracy: true,
  timeout: Infinity,
  maximumAge: 0,
};

const defaultUserSettings = {};

// Source: https://itnext.io/creating-react-useposition-hook-for-getting-browsers-geolocation-2f27fc1d96de
// https://github.com/trekhleb/use-position
// Beware: https://github.com/trekhleb/use-position/issues
// Worth reading too: https://norbertbartos.tech/blog/use-geolocation-api-with-react-hooks/
// More recently updated: https://github.com/bence-toth/react-hook-geolocation#readme

// Also, OL has a good integration example here for geolocation and user position that has bearing / direction as well:
// https://openlayers.org/en/latest/examples/geolocation-orientation.html
// https://github.com/openlayers/openlayers/blob/main/examples/geolocation-orientation.js

export const usePosition = (
  watch = false,
  userSettings = defaultUserSettings
): UsePosition => {
  const settings = useMemo(
    () => ({
      ...defaultSettings,
      ...userSettings,
    }),
    [userSettings]
  );

  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  const onChange = ({ coords, timestamp }: any) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      speed: coords.speed,
      heading: coords.heading,
      timestamp,
    });
  };

  const onError = (error: any) => {
    setError(error.message);
  };

  useEffect(() => {
    if (!navigator || !navigator.geolocation) {
      setError("Geolocation is not supported" as any);
      return;
    }

    if (watch) {
      const watcher = navigator.geolocation.watchPosition(
        onChange,
        onError,
        settings
      );
      return () => navigator.geolocation.clearWatch(watcher);
    }

    navigator.geolocation.getCurrentPosition(onChange, onError, settings);
  }, [settings, watch]);

  return { ...position, error } as UsePosition;
};
