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

const ChildComponents = [];

class Layer extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      map: this.props.view.map,
      layer: this.props.layer
    };
  }

  componentDidMount() {
    if (this.state.map) {
      this.state.map.add(this.state.layer);
    }
  }

  render() {
    return (
      <div>
        {React.Children.map(this.props.children, child =>
          child && React.cloneElement(child, { layer: this.state.layer }))}
      </div>
    );
  }
}

Layer.propTypes = {
  children: (props, propName, componentName) => {
    const prop = props[propName];

    let error = null;
    React.Children.forEach(prop, (child) => {
      if (child && !ChildComponents.includes(child.type)) {
        error = new Error(`'${componentName}' has invalid children component(s).`);
      }
    });
    return error;
  }
};

Layer.defaultProps = {
  children: [],
  url: null,
  portalItem: null,
  visible: true
};

export { Layer };

export default Layer;