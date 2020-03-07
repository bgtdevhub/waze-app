import React, { Component } from 'react';
import './index.css';
import esriLoader from 'esri-loader';

import SearchInput from './SearchInput';
import SearchSuggestions from './SearchSuggestions';
import RouteSwitcher from './RouteSwitcher';

class RouteSearch extends Component {

  state = {
    vm: null,
    searchSuggestionVisible: false,
    suggestions: [],
    startingSearchTerm: '',
    destinationSearchTerm: '',
    isStartSearchType: true,
    startingPoint: null,
    destinationPoint: null,
    startingPointGraphic: null,
    destinationPointGraphic: null
  }

  componentDidMount() {
    esriLoader.loadModules([
      'esri/widgets/Search/SearchViewModel',
      'esri/tasks/Locator'
    ],)
    .then(([SearchViewModel, Locator]) => {
      this.setState({
        vm: new SearchViewModel({
          sources: [{
            locator: new Locator({ url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer" }),
            countryCode: "MY",
            singleLineFieldName: "SingleLine",
            outFields: ["Addr_type"],
          }],
          includeDefaultSources: false
        })
      });

      this.state.vm.watch('suggestions', (results) => {
        const [suggestions] = [results[0].results];
        if (suggestions.length) {
          this.setState({
            suggestions
          });
        }
      });

      this.state.vm.watch('selectedResult', async (result) => {
        const longitude = result.extent.center.longitude;
        const latitude = result.extent.center.latitude;

        window.mapViews[this.props.mapViewId].view.focus();

        if (this.state.isStartSearchType) {
          await this.setState({
            startingPoint: {
              longitude,
              latitude
            }
          })
        } else {
          await this.setState({
            destinationPoint: {
              longitude,
              latitude
            }
          })
        }

        if ((this.state.startingPoint && !this.state.destinationPoint) ||
            (!this.state.startingPoint && this.state.destinationPoint)) {
          // only go to a point when it's only single point selected
          window.mapViews[this.props.mapViewId].view.goTo([longitude, latitude]);
        }

        this.placeStartFinishMarker();

        this.getRoute();
      });

      // To populate start and destination search
      window.mapViews[this.props.mapViewId].view.on('click', (event) => {
        if (this.state.vm.activeSource) {

          this.setState({
            searchSuggestionVisible: false
          })

          if (this.state.startingPoint && this.state.destinationPoint) {
            window.mapViews[this.props.mapViewId].view.graphics.removeAll();

            this.setState({
              startingSearchTerm: '',
              startingPoint:null,
              destinationSearchTerm: '',
              destinationPoint: null,
              isStartSearchType: true
            })
          } else if (this.state.startingPoint) {
            this.setState({
              isStartSearchType: false
            })
          } else {
            this.setState({
              isStartSearchType: true
            })
          }

          const geocoder = this.state.vm.activeSource.locator;

          geocoder.locationToAddress({
            location: event.mapPoint
          })
            .then(response => {
              const address = response.attributes.LongLabel;

              if (this.state.isStartSearchType) {
                this.setState({
                  startingSearchTerm: address,
                  startingPoint: {
                    longitude: response.location.longitude,
                    latitude: response.location.latitude
                  },
                  isStartSearchType: !this.state.isStartSearchType
                })
              } else {
                this.setState({
                  destinationSearchTerm: address,
                  destinationPoint: {
                    longitude: response.location.longitude,
                    latitude: response.location.latitude
                  },
                  isStartSearchType: !this.state.isStartSearchType
                })
              }
    
              this.placeStartFinishMarker();
    
              this.getRoute();
            })
          .catch(console.error)
        }
      });

    })
    .catch(err => {
      // handle any errors
      console.error(err);
    });
  }

  async placeStartFinishMarker() {

    const [Graphic] = await esriLoader.loadModules(['esri/Graphic']);

    window.mapViews[this.props.mapViewId].view.graphics.removeAll();
    window.mapViews[this.props.mapViewId].view.map.removeAll();

    if (this.state.startingPoint) {
        const point = {
          type: "point",
          longitude: this.state.startingPoint.longitude,
          latitude: this.state.startingPoint.latitude
        };

        // Create a symbol for drawing the point
        const markerSymbol = {
          type: "simple-marker",
          color: "#ffffff",
          size: "20px",
          outline: {
            color: "#009c68",
            width: 4
          }
        };

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol
        });

        window.mapViews[this.props.mapViewId].view.graphics.add(pointGraphic);

        this.setState({
          startingPointGraphic: pointGraphic
        });
    }

    if (this.state.destinationPoint) {
      const point = {
        type: "point",
        longitude: this.state.destinationPoint.longitude,
        latitude: this.state.destinationPoint.latitude
      };

      const pictureSymbol = {
        type: "picture-marker",
        url: "img/destination.svg",
        width: "50px",
        height: "50px"
      };

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: pictureSymbol
      });

      window.mapViews[this.props.mapViewId].view.graphics.add(pointGraphic);

      this.setState({
        destinationPointGraphic: pointGraphic
      });
    }
  }

  async getRoute() {

    if (this.state.startingPoint && this.state.destinationPoint) {

      const [RouteTask] = await esriLoader.loadModules(["esri/tasks/RouteTask"]);
      const [RouteParameters] = await esriLoader.loadModules(["esri/tasks/support/RouteParameters"]);
      const [FeatureSet] = await esriLoader.loadModules(["esri/tasks/support/FeatureSet"]);

      const routeTask = new RouteTask({
        url: "https://utility.arcgis.com/usrsvcs/appservices/jbQvbw7pEjtGXgT7/rest/services/World/Route/NAServer/Route_World/solve"
      });

      // Setup the route parameters
      const routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: [this.state.startingPointGraphic, this.state.destinationPointGraphic]
        }),
        returnDirections: true
      });

      // Get the route
      const data = await routeTask.solve(routeParams);
        // Display the route
      data.routeResults.forEach(result => {
        result.route.symbol = {
          type: "simple-line",
          color: [0, 0, 255, 0.3],
          style: "short-dash-dot",
          width: 2
        };
        window.mapViews[this.props.mapViewId].view.graphics.add(result.route);

        if (result.route && result.route.geometry) {
          result.route.geometry.extent.xmin -= 0.02;
          result.route.geometry.extent.xmax += 0.02;
          result.route.geometry.extent.ymin -= 0.03;
          result.route.geometry.extent.ymax += 0.02;

          window.mapViews[this.props.mapViewId].view.goTo(result.route.geometry.extent);

          this.props.dimMapAndHighlightRoute(result.route);
        }
      });
    } else {
      this.props.dimMapAndHighlightRoute(null);
    }
  }

  async switchRoute() {
    if (this.state.startingPoint || this.state.destinationPoint) {
      const intermediatePoint = this.state.startingPoint;
      const intermediateSearchTerm = this.state.startingSearchTerm;

      await this.setState({
        startingPoint: this.state.destinationPoint,
        startingSearchTerm: this.state.destinationSearchTerm
      });

      await this.setState({
        destinationPoint: intermediatePoint,
        destinationSearchTerm: intermediateSearchTerm
      });

      this.placeStartFinishMarker();

      this.getRoute();
    }
  }

  doSearch(searchTerm, isStartSearchType) {
    if (isStartSearchType) {
      this.setState({
        startingSearchTerm: searchTerm,
        searchSuggestionVisible: false,
        suggestions: []
      });
    } else {
      this.setState({
        destinationSearchTerm: searchTerm,
        searchSuggestionVisible: false,
        suggestions: []
      });
    }
    
    this.state.vm.search(searchTerm);
  }

  showSuggestion(searchTerm, isStartSearchType) {
    if (searchTerm) {
      if (isStartSearchType) {
        this.setState({
          searchSuggestionVisible: true,
          startingSearchTerm: searchTerm,
          isStartSearchType: true
        });
      } else {
        this.setState({
          searchSuggestionVisible: true,
          destinationSearchTerm: searchTerm,
          isStartSearchType: false
        });
      }
      
      const myState = {...this.state}; // to get around the state mutation warning
      myState.vm.maxSuggestions = 3;
      myState.vm.suggest(searchTerm);

    } else {
      if (isStartSearchType) {
        this.setState({
          startingSearchTerm: '',
          suggestions: [],
          searchSuggestionVisible: false,
          isStartSearchType: true,
          startingPoint: null
        });
      } else {
        this.setState({
          destinationSearchTerm: '',
          suggestions: [],
          searchSuggestionVisible: false,
          isStartSearchType: false,
          destinationPoint: null
        });
      }

      this.placeStartFinishMarker();
    }
  }

  render() {
    return (
      <div className="route-search">
        <div className="starting-finishing-symbol">
          <i className="material-icons trip-origin">trip_origin</i>
          <svg height="8" width="8">
            <circle cx="4" cy="4" r="2" fill="#cccccc" />
          </svg>
          <svg height="8" width="8">
            <circle cx="4" cy="4" r="2" fill="#cccccc" />
          </svg>
          <i className="material-icons trip-end">place</i>
        </div>

        <div className="route-search-inputs">
          <SearchInput
            placeholder="Search starting point, or click on the map"
            showSuggestion={this.showSuggestion.bind(this)}
            searchTerm={this.state.startingSearchTerm}
            isStartSearchType={true}
          />
          <SearchInput
            placeholder={this.state.startingPoint ? "Search destination, or click on the map" : "Search destination"}
            showSuggestion={this.showSuggestion.bind(this)}
            searchTerm={this.state.destinationSearchTerm}
            isStartSearchType={false}
          />
        </div>

        <RouteSwitcher
          switchRoute={this.switchRoute.bind(this)}
        />

        <SearchSuggestions
          visible={this.state.searchSuggestionVisible}
          suggestions={this.state.suggestions}
          doSearch={this.doSearch.bind(this)}
          isStartSearchType={this.state.isStartSearchType}
        />
      </div>
    );
  }
}

export default RouteSearch;
