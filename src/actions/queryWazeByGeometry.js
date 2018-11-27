import { QUERY_WAZE_BY_GEOMETRY } from '../constants/actions';

export const queryWazeByGeometry = (route, view) => {
  return {
      type: QUERY_WAZE_BY_GEOMETRY,
      route,
      view
  }
}
