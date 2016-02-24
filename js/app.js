var viewModel = {

    init: function () {

        model.init();

        var that = this;

        this.allMarkers = ko.observableArray([]);
        model.mapMarkerList.forEach(function(markerObj) {
            that.allMarkers.push(markerObj);
            that.addMarker(markerObj);
        })
    },

    addMarker: function (marker) {
        marker.setMap(map);
    },

    removeMarker: function (marker) {
        marker.setMap(null);
    }



};

var model = {


    init: function () {
        this.mapMarkerList = [];
        var that = this;
        venueLocations().forEach(function (venueObj) {
            that.mapMarkerList.push(new google.maps.Marker({
                position: {lat: venueObj.lat, lng: venueObj.lng},
                title: venueObj.name
            }));
        });
    }


};


//$(document).ready(function () {
//    ko.applyBindings(new ViewModel());
//});


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



