import { combineReducers } from 'redux';
import layers from './addFeatureLayer';
import queryWazeByGeometry from './queryWazeByGeometry';

const rootReducer = combineReducers({
  layers,
  queryWazeByGeometry
});

export default rootReducer;