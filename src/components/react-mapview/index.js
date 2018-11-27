/* Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { Component } from 'react';
import './index.css';
import PropTypes from 'prop-types';
import EventListeners from './event-listeners';

import Map, { Layer }  from './map';

import { loadEsriMapView } from './load';

const ChildComponents = [Map];

class MapView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      view: (window.mapViews && window.mapViews[this.props.id] &&
        window.mapViews[this.props.id].view) || null
    };
  }

  componentDidMount() {
    if (window.mapViews && window.mapViews[this.props.id]) {
      this.componentRef.appendChild(window.mapViews[this.props.id].container);
      return;
    }

    this.loadMapView();
  }

  async loadMapView() {
    const viewSettings = {};
    
    const view = await loadEsriMapView(this.componentRef, this.props.id, viewSettings);
    await this.setState({ view });

    this.props.setLoadedMapId(this.props.id);
  }

  render() {
    return (
      <div
        id="mapview"
        ref={(ref) => { this.componentRef = ref }}
      >
        {
          this.state.view &&
          React.Children.map(this.props.children,
            child => child && React.cloneElement(child, {
              ...this.state,
            })
          )
        }
        {
          this.state.view && this.props.onClick && <EventListeners.Click
            view={this.state.view}
            onClick={this.props.onClick}
          />
        }
      </div>
    )
  }
}

MapView.propTypes = {
  children: (props, propName, componentName) => {
    const prop = props[propName];

    let error = null;
    React.Children.forEach(prop, (child) => {
      if (child && !ChildComponents.includes(child.type)) {
        error = new Error(`'${componentName}' has invalid children component(s).`);
      }
    });
    return error;
  },
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

MapView.defaultProps = {
  children: [],
  onClick: null
};

// MapView.Map = Map;

export {
  Map,
  Layer
}

export default MapView;