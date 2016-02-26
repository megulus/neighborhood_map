var ViewModel = function () {


    var that = this;

    this.allVenues = ko.observableArray([]);
    model.venueLocations.forEach(function (venueObj) {
        that.allVenues.push(venueObj);
    });

    this.currentVenue = ko.observable();

    this.setCurrentVenue = function () {
        if (that.currentVenue() != null) {
            var id = that.currentVenue().id;
            model.closeWindow(id);
        }
        that.currentVenue(this);
        id = that.currentVenue().id;
        model.openWindow(id);
        model.bounceMarker(id);
    };

    this.filter = ko.observable('');
    this.items = ko.observableArray([]);
    this.allVenues().forEach(function (venue) {
        that.items.push(venue);
    });


    this.filteredByName = ko.dependentObservable(function () {
        var filter = that.filter().toLowerCase();
        if (!filter) {
            return that.items();
        } else {
            return ko.utils.arrayFilter(that.items(), function (item) {
                return model.stringStartsWith(item.name.toLowerCase(), filter);
            })
        }
    }, this);
};


var model = {


    init: function () {
        this.venueLocations = [];
        this.venueIDs = new Set();
        this.markerDict = {};
        this.infowindowDict = {};
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
            ko.applyBindings(new ViewModel());
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
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 2000);


        });

        this.venueIDs.add(venueObj.id);
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

    // utility function:
    stringStartsWith: function (string, startsWith) {
        string = string || '';
        if (startsWith.length > string.length) {
            return false;
        } else {
            return string.substring(0, startsWith.length) === startsWith;
        }
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


var map;
var initMap = function () {

    var mapOptions = {
        center: {lat: 40.663179, lng: -73.969167},
        zoom: 12
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);


};

model.init();




