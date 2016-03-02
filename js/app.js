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


// Model object to handle venue data
var model = {


    init: function () {
        this.venueLocations = [];
        this.venueIDs = new Set();
        this.venueEventDict = {};
        this.findEvents();
        console.log('here');
    },


    findEvents: function () {
        var eventsUrl = 'https://api.seatgeek.com/2/events?';
        var params = {
            'venue.city': 'Brooklyn',
            per_page: 300
        };
        var url = eventsUrl + $.param(params);
        var jqxhr = $.getJSON(url);
        var that = this;
        jqxhr.done(function (data) {
            console.log('done with async call');
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
        });
        jqxhr.error(function (e) {
            $('.venue-header').text('Unable to load venue information.');
            $('.filter').css({'display': 'none'});
        });

    },

    // utility function:
    stringContains: function (string, substring) {
        return string.indexOf(substring) >= 0;
    },

    Venue: function (venuedata) {
        return {
            name : venuedata.name,
            address : venuedata.address,
            state : venuedata.state,
            cityStZip : venuedata.extended_address,
            id : venuedata.id,
            lat : venuedata.location.lat,
            lng : venuedata.location.lon
        };
    }

};

//model.init();


// View object only for Google Maps API related views (i.e., map markers, infowindows)
var googleMapView = {


    init: function () {

        console.log('googleMapView init');

        this.markerDict = {};
        this.infowindowDict = {};
        this.venueEventDict = modelViewHelper.getVenueEventDict();
        this.venueIDs = modelViewHelper.getVenueIDs();

        //console.log(Object.keys(this.venueEventDict).length);
        //console.log(this.venueIDs.size);

        var that = this;

        this.venueIDs.forEach(function (id) {
            //console.log('venueIDs forEach');
            that.createMapMarker(that.venueEventDict[id][0], that.venueEventDict[id][1]);
        });


    },

    createMapMarker: function (venueObj, eventObj) {
        var marker = new google.maps.Marker({
            position: {lat: venueObj.location.lat, lng: venueObj.location.lon},
            title: venueObj.name,
            map: map
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

        marker.addListener('click', function () {
            map.setCenter(marker.position);
            infowindow.open(map, marker);
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
    },

    closeWindow: function (id) {
        var marker = this.markerDict[id];
        var infowindow = this.infowindowDict[id];
        infowindow.close(map, marker);
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
        modelViewHelper.getVenueLocations().forEach(function (venue) {
            if (filteredIds.has(venue.id)) {
                that.markerDict[venue.id].setMap(map);
            } else {
                that.markerDict[venue.id].setMap(null);
            }
        });
    }

};

var modelViewHelper = {

    init: function () {
        model.init();
        googleMapView.init();

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

modelViewHelper.init();


// viewModel object handles knockout.js functionality
var viewModel = {

    items: ko.observableArray(),
    filter: ko.observable(''),
    currentVenue: ko.observable(),


    init: function () {
        var that = this;
        model.venueLocations.forEach(function (venue) {
            that.items.push(venue);
        })
    },


    setCurrentVenue: function () {
        viewModel.currentVenue(this);
        //$(this).toggleClass('active-item');
    }


};

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


var viewModelHelper = {
    init: function () {

        viewModel.init();
        ko.applyBindings(viewModel);
    }
};


viewModelHelper.init();

/*var Venue = function (venuedata) {
 this.name = venuedata.name;
 this.address = venuedata.address;
 this.state = venuedata.state;
 this.cityStZip = venuedata.extended_address;
 this.id = venuedata.id;
 this.lat = venuedata.location.lat;
 this.lng = venuedata.location.lon;
 };*/


//model.init();







