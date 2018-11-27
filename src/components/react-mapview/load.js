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

import esriLoader from 'esri-loader';

const uiPositions = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

export const loadEsriMapView = async (componentRef, id, mapviewSettings) => {
  if (!window.mapViews) {
    window.mapViews = {};
  }

  if (window.mapViews[id]) {
    componentRef.appendChild(window.mapViews[id].container);
    return window.mapViews[id].view;
  }

  const container = document.createElement('DIV');
  container.style = 'width: 100%; height: 100%;';
  componentRef.appendChild(container);

  const [MapView] = await esriLoader.loadModules(['esri/views/MapView']);

  const view = new MapView({ container, ...mapviewSettings });
  window.mapViews[id] = { container, view };

  uiPositions.forEach(position => view.ui.empty(position));

  return view;
};

export default loadEsriMapView;
