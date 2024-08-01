import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Avatar, Box, CircularProgress, IconButton, Snackbar } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { useGoogleMapsImportQuery } from '../../../app/services/googlemapsimport';
import { Map } from '../../../app/services/maps';
import { FeatureSchema, FeatureSchemaFieldType } from '../../../app/services/schemas';
import { mapaThemeMapButtonControlGrey } from '../../../app/ui/theme';
import { isClipboardApiSupported } from '../../../app/utils';
import { selectActiveMapId } from '../../app/appSlice';
import { createNewMapaFeatureObjectFromKnownCoordinates } from '../../features/featuresSlice';
import { selectMapsResult } from '../../maps/mapsSlice';
import { getFirstFieldFromSchemaDefinitionByName } from '../../schemas/schemaHelpers';
import { getSchemasAvailableForMap } from '../../schemas/schemasSlice';

function GoogleMapsImportButtonEntrypointLayer1() {
	const activeMapId = useAppSelector((state) => selectActiveMapId(state));
	const maps = useAppSelector((state) => selectMapsResult(state));
	const activeMap = activeMapId !== undefined && maps.data !== undefined ? maps.data.entities[activeMapId] : undefined;

	if (activeMap === undefined) {
		return null;
	}

	if (isClipboardApiSupported() === true) {
		return <GoogleMapsImportButtonEntrypointLayer2 map={activeMap} />;
	} else {
		return null;
	}
}

interface PropsEntrypointLayer2 {
	map: Map;
}

function GoogleMapsImportButtonEntrypointLayer2(props: PropsEntrypointLayer2) {
	const { map } = props;

	const availableSchemas = useAppSelector((state) => getSchemasAvailableForMap(state, map.id));

	// If we only have one schema, and it has has a field called "Name" (see EntrypointLayer3), then we automatically populate that field with the name of the place.
	// If not, they'll just have to type it in themselves!
	if (availableSchemas.length === 1) {
		return <GoogleMapsImportButtonEntrypointLayer3 map={map} schema={availableSchemas[0]} />;
	} else {
		return <GoogleMapsImportButton map={map} />;
	}
}

interface PropsEntrypointLayer3 {
	map: Map;
	schema: FeatureSchema;
}

function GoogleMapsImportButtonEntrypointLayer3(props: PropsEntrypointLayer3) {
	const { map, schema } = props;

	const field = schema !== undefined ? getFirstFieldFromSchemaDefinitionByName(schema, 'Name') : undefined;

	if (field?.type === FeatureSchemaFieldType.TextField) {
		return <GoogleMapsImportButton map={map} schema={schema} schemaFieldIdForName={field.id} />;
	} else {
		return <GoogleMapsImportButton map={map} />;
	}
}

interface Props {
	map: Map;
	schema?: FeatureSchema;
	schemaFieldIdForName?: number;
}

function GoogleMapsImportButton(props: Props) {
	const { map, schema, schemaFieldIdForName } = props;

	const navigate = useNavigate();

	const [googleMapsShareLink, setGoogleMapsShareLink] = useState<string | undefined>(undefined);

	// ######################
	// Google Maps Import Query
	// ######################
	const {
		data: googleMapsImportResponse,
		isFetching: isRunningGoogleMapsImport,
		isSuccess: isSuccessRunningGoogleMapsImport,
		isError: isErrorRunningGoogleMapsImport,
	} = useGoogleMapsImportQuery(googleMapsShareLink !== undefined ? googleMapsShareLink : skipToken);

	useEffect(() => {
		if (isSuccessRunningGoogleMapsImport === true && googleMapsImportResponse !== undefined) {
			if (schema !== undefined && schemaFieldIdForName !== undefined) {
				navigate('/FeatureManager/Create', {
					state: {
						feature: createNewMapaFeatureObjectFromKnownCoordinates(
							map.id,
							schema.id,
							googleMapsImportResponse.lat,
							googleMapsImportResponse.lon,
							[
								{
									value: googleMapsImportResponse.place_name,
									schema_field_id: schemaFieldIdForName,
								},
							],
						),
					},
				});
			} else {
				navigate('/FeatureManager/Create', {
					state: {
						feature: createNewMapaFeatureObjectFromKnownCoordinates(
							map.id,
							null,
							googleMapsImportResponse.lat,
							googleMapsImportResponse.lon,
							[],
						),
					},
				});
			}
		}
	}, [googleMapsImportResponse, isSuccessRunningGoogleMapsImport, map.id, navigate, schema, schemaFieldIdForName]);

	useEffect(() => {
		if (isErrorRunningGoogleMapsImport === true) {
			setSnackbarErrorMessage(
				`Oh dear! We couldn't fetch any information from Google Maps about the place that's on your clipboard. The link you supplied was: ${googleMapsShareLink}`,
			);
		}
	}, [googleMapsShareLink, isErrorRunningGoogleMapsImport]);

	// Let's us press the button multiple times in a row because we useEffect() on changes to googleMapsShareLink
	useEffect(() => {
		if (isRunningGoogleMapsImport === false) {
			setGoogleMapsShareLink(undefined);
		}
	}, [isRunningGoogleMapsImport]);
	// ######################
	// Google Maps Import Query (End)
	// ######################

	// ######################
	// Read Clipboard
	// ######################
	const getClipboardContents = async () => {
		try {
			return await navigator.clipboard.readText();
		} catch {
			// Rather than messing about trying to query permissions (Firefox and Safari don't support the standard methods), let's just ask for it and assume any errors are permisson denied.
			// Ref:https://stackoverflow.com/questions/64541534/check-whether-user-granted-clipboard-permisssion-or-not
			// Ref: https://stackoverflow.com/questions/75067090/safari-clipboard-permissions-checking
			setSnackbarErrorMessage(`You haven't granted Mapa permissions to read from your clipboard yet.`);
		}
	};

	const onClickButton = useCallback(async () => {
		try {
			const url = await getClipboardContents();

			if (url !== undefined) {
				const parsedURL = new URL(url);

				// We do this all again in the backend, so this is just a quick sniff test.
				if (parsedURL.hostname === 'maps.app.goo.gl' && parsedURL.pathname.match(/^\/[A-z0-9]+$/) !== null) {
					setGoogleMapsShareLink(url);
				} else {
					// So our catch() handles showing an error message for us.
					throw Error();
				}
			}
		} catch {
			setSnackbarErrorMessage(
				`Oh dear! It looks like the link on your clipboard isn't a valid Google Maps Share Link. They should look like https://maps.app.goo.gl/blahblahblah`,
			);
		}
	}, []);
	// ######################
	// Read Clipboard (End)
	// ######################

	// ######################
	// Error Message Snackbar
	// ######################
	const [snackbarErrorMessage, setSnackbarErrorMessage] = useState<string | undefined>(undefined);

	const handleSnackbarClose = () => {
		setSnackbarErrorMessage(undefined);
	};
	// ######################
	// Error Message Snackbar (End)
	// ######################

	return (
		<React.Fragment>
			{/* Stolen from the "Interactive Integration" example on https://mui.com/material-ui/react-progress/ */}
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Box sx={{ m: 0, position: 'relative' }}>
					<IconButton onClick={onClickButton} disabled={isRunningGoogleMapsImport === true} size="small">
						<Avatar
							sx={{
								bgcolor: mapaThemeMapButtonControlGrey,
							}}
						>
							<GoogleIcon />
						</Avatar>
					</IconButton>

					{isRunningGoogleMapsImport === true && (
						<CircularProgress
							sx={{
								position: 'absolute',
								top: 5,
								left: 5,
								zIndex: 1,
							}}
						/>
					)}
				</Box>
			</Box>

			<Snackbar open={snackbarErrorMessage !== undefined} onClose={handleSnackbarClose} sx={{ width: '80%' }}>
				<Alert severity="error" onClose={handleSnackbarClose}>
					{snackbarErrorMessage}
				</Alert>
			</Snackbar>
		</React.Fragment>
	);
}

export default memo(GoogleMapsImportButtonEntrypointLayer1);
