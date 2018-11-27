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
import PropTypes from 'prop-types';
import esriLoader from 'esri-loader';

import Layer from './layer';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      webmap: null,
    };

    this.loadWebmap();
  }

  async loadWebmap() {
    if (!this.props.view.map) {
      const [WebMap] = await esriLoader.loadModules(['esri/WebMap']);

      const webmap = new WebMap({
        portalItem: this.props.portalItem,
        basemap: this.props.basemap
      });

      await webmap.load();
      this.props.view.map = webmap;
    }

    await this.props.view.when();
    this.setState({ webmap: this.props.view.map });
  }

  renderWrappedChildren(children) {
    return React.Children.map(children, (child) => {
      // This is support for non-node elements (eg. pure text), they have no props
      if (!child || !child.props) {
        return child;
      }

      if (child.props.children) {
        return React.cloneElement(child, {
          children: this.renderWrappedChildren(child.props.children),
          view: this.props.view
        });
      }

      return React.cloneElement(child, {
        view: this.props.view
      });
    });
  }

  render() {
    return this.state.webmap && this.props.view && (
      <div id="map">
        {this.renderWrappedChildren(this.props.children)}
      </div>
    );
  }

}

Map.propTypes = {
  children: PropTypes.node,
  portalItem: PropTypes.object,
  basemap: PropTypes.string
};

Map.defaultProps = {
  children: [],
  portalItem: null,
  basemap: 'topo-vector'
};

export { Layer };

export default Map;