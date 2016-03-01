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
            //ko.applyBindings(viewModel);
            viewModel.init();
            ko.applyBindings(viewModel);
        });
        jqxhr.error(function (e) {
            $('.venue-header').text('Unable to load venue information.');
            $('.filter').css({'display' :  'none'});
            //ko.applyBindings(viewModel);
            viewModel.init();
            ko.applyBindings(viewModel);
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

    recenterMap: function (id) {
        var marker = this.markerDict[id];
        map.setCenter(marker.position);
    },

    filterMarkers: function (venueArray) {
        var that = this;
        var filteredIds = new Set();
        venueArray.forEach(function(venue) {
            var id = venue.id;
            filteredIds.add(venue.id);
        });
        this.venueLocations.forEach(function(venue) {
            if (filteredIds.has(venue.id)) {
                that.markerDict[venue.id].setMap(map);
            } else {
                that.markerDict[venue.id].setMap(null);
            }
        });
    },


    // utility function:
    stringStartsWith: function (string, startsWith) {
        string = string || '';
        if (startsWith.length > string.length) {
            return false;
        } else {
            return string.substring(0, startsWith.length) === startsWith;
        }
    },

    // utility function:
    stringContains: function (string, substring) {
        return string.indexOf(substring) >= 0;
    }


};

model.init();

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



viewModel.currentVenue.subscribe(function(oldValue) {
    if (oldValue) {
        model.closeWindow(oldValue.id);
    }
}, null, "beforeChange");

viewModel.currentVenue.subscribe(function(newValue) {
    var id = newValue.id;
    model.openWindow(id);
    model.bounceMarker(id);
    model.recenterMap(id);
});



viewModel.filteredByName = ko.dependentObservable(function () {
        var stringContains = function(string, substring) {
            return string.indexOf(substring) >= 0;
        };
        var filter = this.filter().toLowerCase();
        if (!filter) {
            model.filterMarkers(this.items());
            return this.items();
        } else {
            /*return ko.utils.arrayFilter(this.items(), function (item) {
                return stringContains(item.name.toLowerCase(), filter);
            })*/
            var filterResults = ko.utils.arrayFilter(this.items(), function(item) {
                return stringContains(item.name.toLowerCase(), filter);
            });
            model.filterMarkers(filterResults);
            console.log(this.items().length);
            return filterResults;

        }
    }, viewModel);







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

var googleError = function () {
    $('#map').text('Unable to load Google Maps');
};

//model.init();

