import { ADD_FEATURE_LAYER_SUCCESSFUL, ADD_FEATURE_LAYER_FAILED } from '../constants/actions';

const layers = (state = [], action) => {
  switch (action.type) {
    case ADD_FEATURE_LAYER_SUCCESSFUL:
      return [...state, action.featureLayer];
    
    case ADD_FEATURE_LAYER_FAILED:
      console.log("Failed to add feature layer");
      return state;
    
    default:
      return state;
  }
}

export default layers;