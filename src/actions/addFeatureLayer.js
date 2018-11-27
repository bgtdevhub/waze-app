import { ADD_FEATURE_LAYER } from '../constants/actions';

export const addFeatureLayer = (settings) => {
  return {
      type: ADD_FEATURE_LAYER,
      settings
  }
}
