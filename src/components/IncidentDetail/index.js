import React,  { Component } from 'react';
import './index.css';

class IncidentDetail extends Component {

  constructor(props) {
    super(props);
    this.incidentDetail = React.createRef();
    this.incidentDetailSymbol = React.createRef();
    this.incidentSubtype = React.createRef();
    this.incidentReportedTime = React.createRef();
  }

  componentDidMount() {
    // loaded up all the img first so that when hover img swapping is faster using css
    this.jamImgTag = document.createElement('IMG');
    this.jamImgTag.src = '/img/jam.png';
    this.jamImgTag.width = "50";
    this.jamImgTag.classList.add('type-hide');
    this.incidentDetailSymbol.current.appendChild(this.jamImgTag);

    this.weatherHazardImgTag = document.createElement('IMG');
    this.weatherHazardImgTag.src = '/img/weatherhazard.png';
    this.weatherHazardImgTag.width = "45";
    this.weatherHazardImgTag.classList.add('type-hide');
    this.incidentDetailSymbol.current.appendChild(this.weatherHazardImgTag);

    this.accidentImgTag = document.createElement('IMG');
    this.accidentImgTag.src = '/img/accident.png';
    this.accidentImgTag.width = "60";
    this.accidentImgTag.classList.add('type-hide');
    this.incidentDetailSymbol.current.appendChild(this.accidentImgTag);

    this.roadClosedImgTag = document.createElement('IMG');
    this.roadClosedImgTag.src = '/img/roadclosed.png';
    this.roadClosedImgTag.width = "40";
    this.roadClosedImgTag.classList.add('type-hide');
    this.incidentDetailSymbol.current.appendChild(this.roadClosedImgTag);
  }

  componentDidUpdate() {
    if (window.mapViews[this.props.mapViewId].view && this.props.wazeLayer) {
      const view = window.mapViews[this.props.mapViewId].view;
      const layer = this.props.wazeLayer;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let highlight;

      view.highlightOptions = {
        color: "#42d9f4",
        haloOpacity: 1,
        fillOpacity: 0
      }

      view.whenLayerView(layer).then(layerView => {
        view.on("pointer-move", event => {
          view.hitTest(event).then(r => {
            if(r.results.length > 0 && r.results[0].graphic && r.results[0].graphic.attributes.type) {
              if (highlight) {
                highlight.remove();
                highlight = null;
              }
              
              highlight = layerView.highlight(r.results[0].graphic.attributes.OBJECTID);

              this.incidentDetail.current.classList.remove('hide');

              const incidentType = r.results[0].graphic.attributes.type;
              let incidentSubtype = r.results[0].graphic.attributes.subtype;

              const splitIncidentSubtype = incidentSubtype.split('_');
              let shiftedSplitIncidentSubtype = [...splitIncidentSubtype];
              shiftedSplitIncidentSubtype.shift();
              const newIncidentSubtype = splitIncidentSubtype[0] + ' (' + shiftedSplitIncidentSubtype.join(' ') +')';

              this.jamImgTag.classList.add('type-hide');
              this.weatherHazardImgTag.classList.add('type-hide');
              this.accidentImgTag.classList.add('type-hide');
              this.roadClosedImgTag.classList.add('type-hide');

              if (incidentType === 'JAM') {
                this.jamImgTag.classList.remove('type-hide');
              } else if (incidentType === 'WEATHERHAZARD') {
                this.weatherHazardImgTag.classList.remove('type-hide');
              } else if (incidentType === 'ACCIDENT') {
                this.accidentImgTag.classList.remove('type-hide');
              } else if (incidentType === 'ROAD_CLOSED') {
                this.roadClosedImgTag.classList.remove('type-hide');
              }

              const dateReported = new Date(r.results[0].graphic.attributes.pubMillis*1000);

              const hour = dateReported.getHours();

              const ampm = hour < 13 ? "AM" : "PM";
              const newHour = hour < 13 ? hour : hour - 12;
              
              const timeStamp = `${('0' + newHour).slice(-2)}:${('0' + dateReported.getMinutes()).slice(-2)} ${ampm}, ${dateReported.getDate()} ${months[dateReported.getMonth()]} ${dateReported.getFullYear()}`;

              this.incidentSubtype.current.innerHTML = incidentSubtype ? newIncidentSubtype : incidentType;
              this.incidentReportedTime.current.innerHTML = `Reported: ${timeStamp}`;
            } else {
              this.incidentDetail.current.classList.add('hide');
              highlight.remove();
              highlight = null;
            }
          })
        });
      });
    }
  }

  render() {
    return (
      <div className="incident-detail hide" ref={this.incidentDetail}>
        <div className="incident-type-symbol" ref={this.incidentDetailSymbol}></div>
        <div className="subtype-and-reported-time">
          <div className="incident-subtype" ref={this.incidentSubtype}></div>
          <div className="incident-reported-time" ref={this.incidentReportedTime}></div>
        </div>
        
      </div>
    )
  }
}

export default IncidentDetail;