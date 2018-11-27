import React, { Component } from 'react';
import './index.css';
import { connect } from 'react-redux';

import MapView, { Map, Layer } from '../react-mapview';
import RouteSearch from '../RouteSearch';
import DimmerHighlighter from '../DimmerHighlighter';
import RouteDetail from '../RouteDetail';
import IncidentDetail from '../IncidentDetail';

import { addFeatureLayer } from '../../actions/addFeatureLayer';
import { queryWazeByGeometry } from '../../actions/queryWazeByGeometry';

class App extends Component {

  state = {
    shouldDimMapAndHighlightRoute: false,
    route: null,
    mapViewId: ''
  }

  componentDidUpdate() {
    if (window.mapViews[this.state.mapViewId] && !this.props.layers.length) {

    }
  }

  setLoadedMapId(mapViewId) {
    if (mapViewId) {
      this.setState({
        mapViewId
      })
    }
  }

  dimMapAndHighlightRoute(route) {
    if (route) {
      this.props.queryWazeByGeometry(route, window.mapViews[this.state.mapViewId].view);

      this.setState({
        shouldDimMapAndHighlightRoute: true,
        route
      })
    } else {
      this.setState({
        shouldDimMapAndHighlightRoute: false,
        route: null
      });
    }
  }

  render() {
    return (
      <div className="app">
        <MapView id="mapview" setLoadedMapId={this.setLoadedMapId.bind(this)}>

          <Map portalItem={{ id: 'eec5036d509149558515f472fa3d14ca' }} >

            {this.props.layers.map((layer) => (
              <Layer key={layer.id} id={layer.id} layer={layer} />
            ))}

          </Map>
        </MapView>

        <RouteSearch mapViewId={this.state.mapViewId} dimMapAndHighlightRoute={this.dimMapAndHighlightRoute.bind(this)} />

        <DimmerHighlighter
          mapViewId={this.state.mapViewId}
          shouldDimMapAndHighlightRoute={this.state.shouldDimMapAndHighlightRoute}
          route={this.state.route}
        />

        <RouteDetail
          mapViewId={this.state.mapViewId}
          wazeLayer={this.props.wazeLayer}
          route={this.state.route}
        />

        <IncidentDetail
          mapViewId={this.state.mapViewId}
          wazeLayer={this.props.wazeLayer}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    layers: state.layers,
    wazeLayer: state.queryWazeByGeometry.wazeLayer
  }
}

const actions = {
  addFeatureLayer,
  queryWazeByGeometry
}

export default connect(mapStateToProps, actions)(App);
