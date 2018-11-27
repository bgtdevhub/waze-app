import React, { Component } from 'react';
import Chart from 'chart.js';
import esriLoader from 'esri-loader';
import './index.css';

class RouteDetail extends Component {

  constructor(props) {
    super(props);
    this.incidentChartRef = React.createRef();
    this.routeDetailPanel = React.createRef();
    this.incidentCategoriesRef = React.createRef();
    this.incidentCountRef = React.createRef();
    this.incidentTimeAggregateChartRef = React.createRef();
    this.routeHealthScoringRef = React.createRef();

    this.incidentChart = null;
    this.selectedIncidentType = null;
    this.incidentTimeAggregateChart = null;

    this.labels = [];
    this.colors = [];
    this.dataPerType = {};
  }

  getLabelsAndData(features) {
    const labels = [];
    const colors = [];
    const data = {};

    features.forEach(feature => {
      if (!labels.includes(feature.attributes.type)) {
        const label = feature.attributes.type;
        labels.push(label);

        if (this.selectedIncidentType) {
          if (this.selectedIncidentType !== label) {
            colors.push("rgba(0, 0, 0, 0.1)");
          } else {
            if (label === "JAM") {
              colors.push("rgba(255, 109, 109, 1)");
            }

            if (label === "ROAD_CLOSED") {
              colors.push("rgba(253, 220, 0, 1)");
            }

            if (label === "ACCIDENT") {
              colors.push("rgba(0, 127, 166, 1)");
            }

            if (label === "WEATHERHAZARD") {
              colors.push("rgba(94, 168, 60, 1)");
            }
          }
        } else {
          if (label === "JAM") {
            colors.push("rgba(255, 109, 109, 1)");
          }

          if (label === "ROAD_CLOSED") {
            colors.push("rgba(253, 220, 0, 1)");
          }

          if (label === "ACCIDENT") {
            colors.push("rgba(0, 127, 166, 1)");
          }

          if (label === "WEATHERHAZARD") {
            colors.push("rgba(94, 168, 60, 1)");
          }
        }

        data[feature.attributes.type] = 1;
      } else {
        data[feature.attributes.type]++;
      }
    });

    const dataPerType = Object.keys(data).map((key) => data[key]);

    this.labels = labels;
    this.colors = colors;
    this.dataPerType = dataPerType;

    return [labels, colors, dataPerType];
  }

  highlightFeaturesInMap(event, selectedChart = null) {

    let firstPoint;

    if (selectedChart) {
      if (selectedChart === "doughnut") {
        firstPoint = this.incidentChart.getElementAtEvent(event)[0];
      } else if (selectedChart === "stackedbar") {
        firstPoint = this.incidentTimeAggregateChart.getElementAtEvent(event)[0];
      }
    } else {
      firstPoint = event;
    }

    let selectedIncidentTypeFromChart;

    if (firstPoint) {
      if (typeof(firstPoint) === "string") {
        selectedIncidentTypeFromChart = firstPoint;
      } else {
        if (selectedChart === "doughnut") {
          selectedIncidentTypeFromChart = this.incidentChart.data.labels[firstPoint._index];
        } else {
          selectedIncidentTypeFromChart = this.incidentTimeAggregateChart.data.datasets[firstPoint._datasetIndex].label;
        }
      }

      const incidentTypeSymbolDefault = [
        {
          value: "JAM",
          symbol: {
            type: "simple-marker",
            color: [255, 109, 109],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "ROAD_CLOSED",
          symbol: {
            type: "simple-marker",
            color: [253, 220, 0],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "ACCIDENT",
          symbol: {
            type: "simple-marker",
            color: [0, 127, 166],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        },
        {
          value: "WEATHERHAZARD",
          symbol: {
            type: "simple-marker",
            color: [94, 168, 60],
            size: 10,
            outline: {
              width: 1,
              color: [255, 255, 255]
            }
          }
        }
      ];

      let incidentTypeSymbol = [];

      if (this.selectedIncidentType === selectedIncidentTypeFromChart) {
        incidentTypeSymbol = incidentTypeSymbolDefault;

        this.selectedIncidentType = null;
      } else {
        this.selectedIncidentType = selectedIncidentTypeFromChart;

        incidentTypeSymbolDefault.forEach(incidentType => {
          if(incidentType.value !== selectedIncidentTypeFromChart) {
            incidentType.symbol.color = [0, 0, 0, 0.1];
            incidentType.symbol.size = "8";
          } else {
            incidentType.symbol.size = "10";
          }
        })

        incidentTypeSymbol = incidentTypeSymbolDefault;
      }

      const defaultSymbol = {
        type: "simple-marker",
        color: [226, 119, 40],
        outline: {
          width: 1,
          color: [255, 255, 255],
        }
      };

      const renderer = {
        type: "unique-value",
        field: "type",
        defaultSymbol
      }

      renderer.uniqueValueInfos = incidentTypeSymbol;

      this.props.wazeLayer.renderer = renderer;
    }
  }

  drawDoughnutChart(features) {
    const incidentCtx = this.incidentChartRef.current.getContext('2d');

    if (features.length) {
      const [labels, colors, dataPerType] = this.getLabelsAndData(features);

      this.routeDetailPanel.current.classList.remove("hide");

      if (!this.incidentChart) {
        this.incidentChart = new Chart(incidentCtx, {
          type: 'doughnut',
          data: {
              labels,
              datasets: [{
                  data: dataPerType,
                  backgroundColor: colors,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)"
              }],
          },
          options: {
            onClick: (e) => this.highlightFeaturesInMap(e, "doughnut"),
            legend: {
              display: false
            },
            cutoutPercentage: 60
          }
        })

      } else {
        this.incidentChart.data.labels = labels;
        this.incidentChart.data.datasets = [{
            data: dataPerType,
            backgroundColor: colors,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)"
        }];

        this.incidentChart.update();
      }

      this.incidentCountRef.current.innerHTML = features.length;
    } else {
      this.routeDetailPanel.current.classList.add("hide");
    }
  }

  drawStackedBarChart(features) {
    if (features.length) {

      const datasets = {};

      this.labels.forEach((label, index) => {
        datasets[label] = {
          label: label,
          backgroundColor: this.colors[index],
          data: new Array(24).fill(0)
        }
      });

      features.forEach(feature => {
        const pubMillis = feature.attributes.pubMillis;
        const date = new Date(pubMillis*1000);
        const hour = date.getHours();

        datasets[feature.attributes.type].data[hour]++;
      });

      const datasetsArray = Object.keys(datasets).map((key) => datasets[key]);

      if (!this.incidentTimeAggregateChart) {
        const incidentTimeAggregateCtx = this.incidentTimeAggregateChartRef.current.getContext('2d');

        this.incidentTimeAggregateChart = new Chart(incidentTimeAggregateCtx, {
          type: 'bar',
          data: {
              labels: [
                '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
                '21', '22', '23', '24'
              ],
              datasets: datasetsArray
          },
          options: {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            title: {
              display: true,
              text: 'Aggregated Incidents in 24 Hours'
            },
            legend: {
              onClick: (e) => e.stopPropagation()
            },
            tooltips: {
              callbacks: {
                 title: function() {}
              }
            },
            onClick: (e) => this.highlightFeaturesInMap(e, "stackedbar")
          }
        })

      } else {
        this.incidentTimeAggregateChart.data.datasets = datasetsArray;

        this.incidentTimeAggregateChart.update();
      }
    }
  }

  createIncidentCategories() {

    if (this.labels.length) {

      while (this.incidentCategoriesRef.current.firstChild) {
        this.incidentCategoriesRef.current.removeChild(this.incidentCategoriesRef.current.firstChild);
      }

      this.labels.forEach((element, index) => {
        const backgroundColor = this.colors[index];

        const categoryCountDiv = document.createElement('DIV');
        categoryCountDiv.classList.add('category-count');
        categoryCountDiv.style.backgroundColor = backgroundColor;
        categoryCountDiv.style.order = -this.dataPerType[index];
        categoryCountDiv.style.cursor = "pointer";
        categoryCountDiv.addEventListener("click", (e) => {
          const label = e.target.innerHTML.split(" ")[0];
          this.highlightFeaturesInMap(label);
        })

        const detailDiv = document.createElement('DIV');
        detailDiv.classList.add("detail");
        detailDiv.innerHTML = `${element} (${this.dataPerType[index]})`;

        categoryCountDiv.appendChild(detailDiv);

        this.incidentCategoriesRef.current.appendChild(categoryCountDiv);
      });
    }
  }

  showRouteHealthScoring(route, features) {

    while (this.routeHealthScoringRef.current.firstChild) {
      this.routeHealthScoringRef.current.removeChild(this.routeHealthScoringRef.current.firstChild);
    }

    const averageIncidentInKM = features / route.attributes.Total_Kilometers;

    const scoreLabelDiv = document.createElement('DIV');
    scoreLabelDiv.classList.add('health-score-label');
    scoreLabelDiv.innerHTML = "Health Score";
    this.routeHealthScoringRef.current.appendChild(scoreLabelDiv);

    const scoreDiv = document.createElement('DIV');
    scoreDiv.classList.add('score-div');

    const score = ((200 - averageIncidentInKM) / 200) * 100;

    if (score <= 50) {
      scoreDiv.classList.add("bad");
    } else if (score > 50 && score <= 70) {
      scoreDiv.classList.add("ok");
    } else {
      scoreDiv.classList.add("good");
    }

    scoreDiv.innerHTML = score.toFixed(0);

    this.routeHealthScoringRef.current.appendChild(scoreDiv);

    const routeLengthDiv = document.createElement('DIV');
    routeLengthDiv.classList.add('route-length-div');
    routeLengthDiv.innerHTML = "Route length: " + route.attributes.Total_Kilometers.toFixed(2) + " KM";
    this.routeHealthScoringRef.current.appendChild(routeLengthDiv);

    const averageDiv = document.createElement('DIV');
    averageDiv.classList.add('average-div');
    averageDiv.innerHTML = "Average " + averageIncidentInKM.toFixed(2) + " Incidents in a KM";
    this.routeHealthScoringRef.current.appendChild(averageDiv);
  }

  async componentDidUpdate() {
    if (!this.props.route) {
      this.routeDetailPanel.current.classList.add("hide");
    }

    if (window.mapViews[this.props.mapViewId].view && this.props.wazeLayer) {
      const [Query] = await esriLoader.loadModules(['esri/tasks/support/Query']);
      const view = window.mapViews[this.props.mapViewId].view;
      const layer = this.props.wazeLayer;

      view.watch("updating", val => {
          if (!val && layer) {
            view.whenLayerView(layer).then(layerView => {
              if (layer) {
                const layerViewQuery = new Query();
                layerViewQuery.geometry = view.extent;
                layerViewQuery.spatialRelationship = "intersects";

                try {
                  layerView.queryFeatures(layerViewQuery).then(results => {
                    this.drawDoughnutChart(results.features);
                    this.createIncidentCategories();
                    this.drawStackedBarChart(results.features);
                    this.showRouteHealthScoring(this.props.route, layer.source.items.length);
                  });
                } catch (e) {
                  console.log(e);
                }
              }
            });
          }
      });
    }
  }
  
  render() {
    return (
      <div className="route-detail hide" ref={this.routeDetailPanel}>
        <div className="incident-chart">
          <canvas ref={this.incidentChartRef} width="200" height="200"/>
          <div className="incident-count-label">Total Incidents</div>
          <div className="incident-count" ref={this.incidentCountRef}></div>
        </div>
        <div className="incident-categories" ref={this.incidentCategoriesRef}></div>
        <div className="incident-time-aggregate-chart">
          <canvas ref={this.incidentTimeAggregateChartRef} width="580" height="230"/>
        </div>
        <div className="route-health-scoring" ref={this.routeHealthScoringRef}></div>
      </div>
    );
  }
}

export default RouteDetail;
