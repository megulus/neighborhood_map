

var viewModel = {

    allVenues: ko.observableArray(),
    items: ko.observableArray(),
    filter: ko.observable(''),
    currentVenue: ko.observable(),
    that: this,



    setCurrentVenue: function () {
        if (that.currentVenue === null) {
            var id = this.currentVenue.id;
            model.closeWindow(id);
        }
        that.currentVenue(this);
        id = that.currentVenue().id;
        model.openWindow(id);
        model.bounceMarker(id);
    }

};


