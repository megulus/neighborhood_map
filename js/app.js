// Initialize Google Map
var map;

var initMap = function () {

    var mapOptions = {
        center: {lat: 40.663179, lng: -73.969167},
        zoom: 12
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);


};

var googleError = function () {
    $('#map').text('Unable to load Google Maps');
};



$(function () {

    // Model object to handle venue data
    var model = {


            init: function () {
                this.venueLocations = [];
                this.venueIDs = new Set();
                this.venueEventDict = {};
            },

            findEvents: function () {
                var eventsUrl = 'https://api.seatgeek.com/2/events?';
                var params = {
                    'venue.city': 'Brooklyn',
                    per_page: 300
                };
                var url = eventsUrl + $.param(params);
                return $.getJSON(url);
            },

            // create Venue objects and push into various data structures that
            // will be used by the viewModel and googleMapView
            processEvents: function (response) {
                var that = this;
                data = response.responseJSON;
                var events = data.events;
                events.forEach(function (eventObj) {
                    var venueObj = eventObj.venue;
                    var id = venueObj.id;
                    if (venueObj.state === 'NY' && !that.venueIDs.has(id)) {
                        that.venueEventDict[id] = [venueObj, eventObj];
                        that.venueLocations.push(that.Venue(venueObj));
                        that.venueIDs.add(id);
                    }
                });
            },


            // function to determine whether string contains substring
            // used by the viewModel's filtering function
            stringContains: function (string, substring) {
                return string.indexOf(substring) >= 0;
            },

            Venue: function (venuedata) {
                return {
                    name: venuedata.name,
                    address: venuedata.address,
                    state: venuedata.state,
                    cityStZip: venuedata.extended_address,
                    id: venuedata.id,
                    lat: venuedata.location.lat,
                    lng: venuedata.location.lon
                };
            }

        };




    // View object only for Google Maps API related views (i.e., map markers, infowindows)
    // separates this concern from the model, but since it is not handled by knockout.js,
    // it is not going into the viewModel that interacts with knockout
    var googleMapView = {


        init: function () {

            this.markerDict = {};
            this.infowindowDict = {};
            this.venueEventDict = helper.getVenueEventDict();
            this.venueIDs = helper.getVenueIDs();

            var that = this;

            this.venueIDs.forEach(function (id) {
                that.createMapMarker(that.venueEventDict[id][0], that.venueEventDict[id][1]);
            });


        },


        // remaining functions handle creation of map markers and infowindows, as
        // well as the functions that control their behavior when activated by a direct
        // click or a click in the list of venues


        createMapMarker: function (venueObj, eventObj) {
            var marker = new google.maps.Marker({
                position: {lat: venueObj.location.lat, lng: venueObj.location.lon},
                title: venueObj.name,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            var contentStr = '<h3>Venue: ' + venueObj.name + '</h3>' + '<p>Address: '
                + venueObj.address + ', ' + venueObj.extended_address + '</p>'
                + '<p>Upcoming Event: <a href="' + eventObj.url + '">' + eventObj.title
                + '</a></p>' + '<p>Date: '
                + (new Date(eventObj.datetime_local)).toLocaleDateString() + '</p>'
                + '<p>Event Type: ' + eventObj.taxonomies[0].name + '</p>';
            var infowindow = new google.maps.InfoWindow({
                content: contentStr
            });

            infowindow.addListener('closeclick', function () {
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
            });

            marker.addListener('click', function () {
                map.setCenter(marker.position);
                infowindow.open(map, marker);
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    marker.setAnimation(null);
                }, 2000);

            });
            this.markerDict[venueObj.id] = marker;
            this.infowindowDict[venueObj.id] = infowindow;
        },


        openWindow: function (id) {
            var marker = this.markerDict[id];
            var infowindow = this.infowindowDict[id];
            infowindow.open(map, marker);
            // highlighted marker behavior concurrent with window opening:
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        },

        closeWindow: function (id) {
            var marker = this.markerDict[id];
            var infowindow = this.infowindowDict[id];
            infowindow.close(map, marker);
            // un-highlighting marker concurrent with closing window:
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        },

        bounceMarker: function (id) {
            var marker = this.markerDict[id];
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 2000);
        },


        recenterMap: function (id) {
            var marker = this.markerDict[id];
            map.setCenter(marker.position);
        },

        filterMarkers: function (venueArray) {
            var that = this;
            var filteredIds = new Set();
            venueArray.forEach(function (venue) {
                var id = venue.id;
                filteredIds.add(venue.id);
            });
            helper.getVenueLocations().forEach(function (venue) {
                if (filteredIds.has(venue.id)) {
                    that.markerDict[venue.id].setMap(map);
                } else {
                    that.markerDict[venue.id].setMap(null);
                }
            });
        }

    };

    // an "octopus" for the google map view
    var helper = {


        init: function () {
            model.init();
            events = model.findEvents();
            $.when(events)
                .done(function () {
                    model.processEvents(events);
                    googleMapView.init();
                    viewModel.init();
                    ko.applyBindings(viewModel);
                })
                .fail(function () {
                    $('#venue-header').text('Could not load venue data');
                    $('.filter').css({'display': 'none'});
                })
        },

        getVenueEventDict: function () {
            return model.venueEventDict;
        },

        getVenueIDs: function () {
            return model.venueIDs;
        },

        getVenueLocations: function () {
            return model.venueLocations;
        }
    };




    // viewModel object handles knockout.js functionality
    var viewModel = {

        items: ko.observableArray(),
        filter: ko.observable(''),
        currentVenue: ko.observable(),
        selectedVenueId: ko.observable(),


        init: function () {
            var that = this;
            model.venueLocations.forEach(function (venue) {
                that.items.push(venue);
            })
        },


        setCurrentVenue: function () {
            viewModel.currentVenue(this);
            viewModel.selectedVenueId(this.id);
        }


    };

    helper.init();

    viewModel.currentVenue.subscribe(function (oldValue) {
        if (oldValue) {
            googleMapView.closeWindow(oldValue.id);
        }
    }, null, "beforeChange");

    viewModel.currentVenue.subscribe(function (newValue) {
        var id = newValue.id;
        googleMapView.openWindow(id);
        googleMapView.bounceMarker(id);
        googleMapView.recenterMap(id);
    });


    viewModel.filteredByName = ko.dependentObservable(function () {
        var stringContains = function (string, substring) {
            return string.indexOf(substring) >= 0;
        };
        var filter = this.filter().toLowerCase();
        if (!filter) {
            googleMapView.filterMarkers(this.items());
            return this.items();
        } else {
            var filterResults = ko.utils.arrayFilter(this.items(), function (item) {
                return stringContains(item.name.toLowerCase(), filter);
            });
            googleMapView.filterMarkers(filterResults);
            console.log(this.items().length);
            return filterResults;

        }
    }, viewModel);



});









