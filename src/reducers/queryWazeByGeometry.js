import { QUERY_WAZE_BY_GEOMETRY_SUCCESSFUL, QUERY_WAZE_BY_GEOMETRY_FAILED } from '../constants/actions';

const layers = (state = {}, action) => {
  switch (action.type) {
    case QUERY_WAZE_BY_GEOMETRY_SUCCESSFUL:
      return {...state, wazeLayer: action.wazeLayer};
    
    case QUERY_WAZE_BY_GEOMETRY_FAILED:
      console.log("Failed to add query WAZE layer");
      return state;
    
    default:
      return state;
  }
}

export default layers;