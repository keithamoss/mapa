import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';

import App from '../../App';
import AboutPage from '../../features/about/aboutPage';
import SymbolsDebugView from '../../features/app/symbolsDebugView';
import FeatureCreator from '../../features/features/featureCreator';
import FeatureEditor from '../../features/features/featureEditor';
import FeatureManager from '../../features/features/featureManager';
import MapCreator from '../../features/maps/mapCreator';
import MapEditor from '../../features/maps/mapEditor';
import MapHeroIconEditor from '../../features/maps/mapHeroIconEditor';
import MapManager from '../../features/maps/mapsManager';
import SchemaCreator from '../../features/schemas/schemaCreator';
import SchemaDeleteManager from '../../features/schemas/schemaDeleteManager';
import SchemaEditorEntrypoint from '../../features/schemas/schemaEditor';
import SchemaManager from '../../features/schemas/schemaManager';
import SearchFeaturesManager from '../../features/searchFeatures/searchFeaturesManager';
import SearchLocationsManager from '../../features/searchLocations/searchLocationsManager';
import QuickAddSymbolsSettingsManager from '../../features/settings/quickAddSymbolsSettingsManager';
import SettingsManager from '../../features/settings/settingsManager';
import WhatsNewPage from '../../features/whatsNew/whatsNew';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: 'SymbolsDebugView',
				element: <SymbolsDebugView />,
			},
			{
				path: 'MapManager',
				element: <MapManager />,
			},
			{
				path: 'MapManager/Create',
				element: <MapCreator />,
			},
			{
				path: 'MapManager/Edit/:mapId/hero_icon',
				element: <MapHeroIconEditor />,
			},
			{
				path: 'MapManager/Edit/:mapId',
				element: <MapEditor />,
			},
			{
				path: 'SchemaManager',
				element: <SchemaManager />,
			},
			{
				path: 'SchemaManager/Create/:symbolId',
				element: <SchemaCreator />,
			},
			{
				path: 'SchemaManager/Create',
				element: <SchemaCreator />,
			},
			{
				path: 'SchemaManager/Edit/:schemaId/:symbolId',
				element: <SchemaEditorEntrypoint />,
			},
			{
				path: 'SchemaManager/Edit/:schemaId',
				element: <SchemaEditorEntrypoint />,
			},
			{
				path: 'SchemaManager/Delete/:schemaId',
				element: <SchemaDeleteManager />,
			},
			{
				path: 'FeatureManager',
				element: <FeatureManager />,
			},
			{
				path: 'FeatureManager/Create',
				element: <FeatureCreator />,
			},
			{
				path: 'FeatureManager/Edit/:featureId',
				element: <FeatureEditor />,
			},
			{
				path: 'SearchFeaturesManager',
				element: <SearchFeaturesManager />,
			},
			{
				path: 'SettingsManager',
				element: <SettingsManager />,
			},
			{
				path: 'WhatsNew',
				element: <WhatsNewPage />,
			},
			{
				path: 'About',
				element: <AboutPage />,
			},
			{
				path: 'QuickAddSymbolsSettingsManager',
				element: <QuickAddSymbolsSettingsManager />,
			},
			{
				path: 'SearchLocationsManager',
				element: <SearchLocationsManager />,
			},
		],
	},
]);
