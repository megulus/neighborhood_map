
var venueLocations = ko.observableArray([]);

var venueLoader = function () {



    var venuesUrl = 'https://api.seatgeek.com/2/venues?';
    var params = {
        city: 'Brooklyn',
        per_page: 100
    };
    var url = venuesUrl + $.param(params);

    var jqxhr = $.getJSON(url);
    
    jqxhr.done(function (data) {
        var venues = data.venues;
        venues.forEach(function(venuedata) {
            venue = new Venue(venuedata);
            if (venue.state === 'NY') {
                venueLocations.push(venue);
            }
        });
        //$(document).ready(function () {
        //    ko.applyBindings(viewModel());
        //});
        ko.applyBindings(viewModel.init());
    });


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



venueLoader();