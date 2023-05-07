import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import FeatureEditor from "../../features/features/featureEditor";
import FeatureManager from "../../features/features/featureManager";
import MapCreator from "../../features/maps/mapCreator";
import MapEditor from "../../features/maps/mapEditor";
import MapManager from "../../features/maps/mapsManager";
import SchemaCreator from "../../features/schemas/schemaCreator";
import SchemaEditor from "../../features/schemas/schemaEditor";
import SchemaManager from "../../features/schemas/schemaManager";
import SearchManager from "../../features/search/searchManager";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "MapManager",
        element: <MapManager />,
      },
      {
        path: "MapManager/Create",
        element: <MapCreator />,
      },
      {
        path: "MapManager/Edit/:mapId",
        element: <MapEditor />,
      },
      {
        path: "SchemaManager",
        element: <SchemaManager />,
      },
      {
        path: "SchemaManager/Create",
        element: <SchemaCreator />,
      },
      {
        path: "SchemaManager/Edit/:schemaId",
        element: <SchemaEditor />,
      },
      {
        path: "FeatureManager",
        element: <FeatureManager />,
      },
      {
        path: "FeatureManager/Edit/:featureId",
        element: <FeatureEditor />,
      },
      {
        path: "SearchManager",
        element: <SearchManager />,
      },
    ],
  },
]);
