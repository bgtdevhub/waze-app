import React, { Component } from 'react';
import esriLoader from 'esri-loader';
import './index.css';

class DimmerHighlighter extends Component {

  constructor(props) {
    super(props);
    this.mapView = null;
    this.route = null;
  }

  async dimMapAndHighlightRoute() {
    const [Graphic, geometryEngine, Polygon] = await esriLoader.loadModules(['esri/Graphic', 'esri/geometry/geometryEngine', "esri/geometry/Polygon"]);

    const greatPolygon = new Polygon ({
      rings: [ // Malaysia
        [98.8, 0.5],
        [119.8, 0.5],
        [119.8, 7.3],
        [98.8, 7.3],
        [98.8, 0.5]
      ]
    });

    const routeBufferPolygon = geometryEngine.geodesicBuffer(this.route.geometry, 250, "meters");

    const dimmerGeometry = geometryEngine.symmetricDifference(greatPolygon, routeBufferPolygon);

    const dimmerShade = {
      type: "simple-fill",
      color: [0, 0, 0, 0.311223356], // long weird number to identify this object in css
      outline: {
        color: [240, 240, 240, 0.1],
        width: 10
      }
    };

    const dimmer = new Graphic({
      geometry: dimmerGeometry,
      symbol: dimmerShade
    })

    this.mapView.graphics.add(dimmer);
  }

  componentDidUpdate() {
    if (window.mapViews && this.props.route) {
      this.mapView = window.mapViews[this.props.mapViewId].view;
      this.route = this.props.route;
      this.dimMapAndHighlightRoute();
    }
  }
  
  render() {
    return (<div></div>);
  }
}

export default DimmerHighlighter;
