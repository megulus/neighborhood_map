var viewModel = function () {


    model.init();

    var that = this;

    this.allMarkers = ko.observableArray([]);
    model.mapMarkerList.forEach(function (markerObj) {
        that.allMarkers.push(markerObj);
        markerObj.setMap(map);

    });


    this.addMarker = function (marker) {
        marker.setMap(map);
    };


    this.removeMarker = function (marker) {
        marker.setMap(null);
    };

};

var model = {


    init: function () {
        this.venueLocations = ko.observableArray([]);
        this.venueIDs = new Set();
        this.mapMarkerList = [];
        var that = this;
        this.venueLocations().forEach(function (venueObj) {
            that.mapMarkerList.push(new google.maps.Marker({
                position: {lat: venueObj.lat, lng: venueObj.lng},
                title: venueObj.name

            }));
        });
        this.findEvents();
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
            var events = data.events;
            events.forEach(function (eventObj) {
                var venueObj = eventObj.venue;
                var id = venueObj.id;
                if (venueObj.state === 'NY' && !that.venueIDs.has(id)) {
                    that.createMapMarker(venueObj, eventObj);
                    that.venueLocations.push(new Venue(venueObj));
                }
            });
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
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        this.venueIDs.add(venueObj.id);
    }




};

var Venue = function (venuedata) {
    this.name = venuedata.name;
    this.address = venuedata.address;
    this.state = venuedata.state;
    this.cityStZip = venuedata.extended_address;
    this.id = venuedata.id;
    this.lat = venuedata.location.lat;
    this.lng = venuedata.location.lon;
};


$(document).ready(function () {
    ko.applyBindings(viewModel());
});


/* initialize map and display on page
 * Since the model for a Google Map is on Google's servers,
 * it falls outside of our MVO
 */
var map;
var initMap = function () {

    var mapOptions = {
        center: {lat: 40.663179, lng: -73.969167},
        zoom: 12
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);


};



