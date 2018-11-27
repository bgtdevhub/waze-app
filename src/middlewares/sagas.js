import { takeEvery, call, put } from 'redux-saga/effects';
import esriLoader from 'esri-loader';

import {
   ADD_FEATURE_LAYER,
   ADD_FEATURE_LAYER_SUCCESSFUL,
   ADD_FEATURE_LAYER_FAILED,
   QUERY_WAZE_BY_GEOMETRY,
   QUERY_WAZE_BY_GEOMETRY_SUCCESSFUL,
   QUERY_WAZE_BY_GEOMETRY_FAILED
} from '../constants/actions';

const addFeatureLayer = function* (action = {}) {
   try {
      const [FeatureLayer] = yield call(esriLoader.loadModules, ["esri/layers/FeatureLayer"]);

      const featureLayer = new FeatureLayer(action.settings)

      yield put({ type: ADD_FEATURE_LAYER_SUCCESSFUL, featureLayer });
   } catch (e) {
      yield put({ type: ADD_FEATURE_LAYER_FAILED });
   }
};

const queryWazeByGeometry = function* (action = {}) {
   try {
      const [geometryEngine, QueryTask, Query, FeatureLayer] = yield call(esriLoader.loadModules,
            [
               "esri/geometry/geometryEngine",
               "esri/tasks/QueryTask",
               "esri/tasks/support/Query",
               "esri/layers/FeatureLayer"
            ]);

      const routeBufferPolygon = geometryEngine.geodesicBuffer(action.route.geometry, 250, "meters");

      const wazeLayerUrl = 'https://services9.arcgis.com/hbNUXYa0vWyWMkdB/ArcGIS/rest/services/Waze_Alerts_and_Traffic_(View)/FeatureServer/0';

      const queryTask = new QueryTask({
        url: wazeLayerUrl
      });

      const query = new Query();
      query.geometry = routeBufferPolygon;
      query.returnGeometry = true;
      query.outFields = ["*"];

      // When resolved, returns features and graphics that satisfy the query.
      const result = yield call([queryTask, "execute"], query);

      const fields = [
        {
          name: "OBJECTID",
          alias: "OBJECTID",
          type: "oid"
        },
        {
          name: "type",
          alias: "type",
          type: "string"
        },
        {
          name: "subtype",
          alias: "subtype",
          type: "string"
        },
        {
          name: "pubMillis",
          alias: "pubMillis",
          type: "integer"
        }
      ];

      const incidentTypeSymbol = [
        {
          value: "JAM",
          symbol: {
            type: "simple-marker",
            color: [255, 109, 109],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "ROAD_CLOSED",
          symbol: {
            type: "simple-marker",
            color: [253, 220, 0],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "ACCIDENT",
          symbol: {
            type: "simple-marker",
            color: [0, 127, 166],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "WEATHERHAZARD",
          symbol: {
            type: "simple-marker",
            color: [94, 168, 60],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        }
      ]

      const renderer = {
        type: "unique-value",
        field: "type",
        defaultSymbol: {
          type: "simple-marker",
          color: [226, 119, 40],
          outline: {
            width: 1,
            color: [255, 255, 255],
          }
        },
        uniqueValueInfos: incidentTypeSymbol
      }

      let featureLayer = null;

      if (result.features.length) {
        featureLayer = new FeatureLayer({
          source: result.features,
          fields,
          renderer
        });

        action.view.map.add(featureLayer);
      }

      yield put({ type: QUERY_WAZE_BY_GEOMETRY_SUCCESSFUL, wazeLayer: featureLayer });
   } catch (e) {
      console.log(e);
      yield put({ type: QUERY_WAZE_BY_GEOMETRY_FAILED });
   }
};

const mySaga = function* () {
  yield takeEvery(ADD_FEATURE_LAYER, addFeatureLayer);
  yield takeEvery(QUERY_WAZE_BY_GEOMETRY, queryWazeByGeometry);
};

export default mySaga;