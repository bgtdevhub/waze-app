import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers/index';
import createSagaMiddleware from 'redux-saga';

import mySaga from '../middlewares/sagas';

const initialStore = {};

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const sagaMiddleware = createSagaMiddleware();

const middlewares = applyMiddleware(sagaMiddleware);

const enhancer = composeEnhancers(
    middlewares,
    // other store enhancers if any
);

const store = createStore(rootReducer, initialStore, enhancer);
sagaMiddleware.run(mySaga);

window.store = store;
export default store;