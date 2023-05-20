import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { useUpdateUserProfileMutation } from '../../app/services/auth';
import { NewMap, useAddMapMutation } from '../../app/services/maps';
import MapForm from './mapForm';
import { selectAllMaps } from './mapsSlice';

function MapCreator() {
	const navigate = useNavigate();

	const maps = useAppSelector(selectAllMaps);

	const [addMap, { isSuccess: isAddingMapSuccessful /*, isLoading: isAddingMapLoading*/ }] = useAddMapMutation();

	const [
		updateUserProfile,
		{
			isSuccess: isUpdatingUpdateUserProfileSuccessful,
			// isLoading: isUpdatingUpdateUserProfileLoading,
		},
	] = useUpdateUserProfileMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isAddingMapSuccessful === true && isUpdatingUpdateUserProfileSuccessful === true) {
			// Let's send first time users back to the map view, rather than the map list
			if (maps.length === 1) {
				navigate('/');
			} else {
				navigate('/MapManager/');
			}
		}
	}, [isAddingMapSuccessful, isUpdatingUpdateUserProfileSuccessful, maps.length, navigate]);

	// if (isAddingMapSuccessful === true) {
	//   navigate("/MapManager/");
	// }

	const onDoneAdding = useCallback(
		async (map: NewMap) => {
			const newMap = await addMap(map).unwrap();

			// Presumably, if you've just made a map you probably want to switch to using it right away
			updateUserProfile({ last_map_id: newMap.id });
		},
		[addMap, updateUserProfile]
	);

	return <MapForm onDoneAdding={onDoneAdding} />;
}

export default MapCreator;
