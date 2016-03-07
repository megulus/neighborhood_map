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
    $('#responsive-header').text('Unable to load Google Maps');
};
