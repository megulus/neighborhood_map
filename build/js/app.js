$(function(){var e={init:function(){this.venueLocations=[],this.venueIDs=new Set,this.venueEventDict={}},findEvents:function(){var e="https://api.seatgeek.com/2/events?",n={"venue.city":"Brooklyn",per_page:300},t=e+$.param(n);return $.getJSON(t)},processEvents:function(e){var n=this;data=e.responseJSON;var t=data.events;t.forEach(function(e){var t=e.venue,i=t.id;"NY"!==t.state||n.venueIDs.has(i)||(n.venueEventDict[i]=[t,e],n.venueLocations.push(n.Venue(t)),n.venueIDs.add(i))})},stringContains:function(e,n){return e.indexOf(n)>=0},Venue:function(e){return{name:e.name,address:e.address,state:e.state,cityStZip:e.extended_address,id:e.id,lat:e.location.lat,lng:e.location.lon}}},n={init:function(){this.markerDict={},this.infowindowDict={},this.venueEventDict=t.getVenueEventDict(),this.venueIDs=t.getVenueIDs();var e=this;this.venueIDs.forEach(function(n){e.createMapMarker(e.venueEventDict[n][0],e.venueEventDict[n][1])})},createMapMarker:function(e,n){var t=new google.maps.Marker({position:{lat:e.location.lat,lng:e.location.lon},title:e.name,map:map,icon:"http://maps.google.com/mapfiles/ms/icons/red-dot.png"}),i="<h3>Venue: "+e.name+"</h3><p>Address: "+e.address+", "+e.extended_address+'</p><p>Upcoming Event: <a href="'+n.url+'">'+n.title+"</a></p><p>Date: "+new Date(n.datetime_local).toLocaleDateString()+"</p><p>Event Type: "+n.taxonomies[0].name+"</p>",o=new google.maps.InfoWindow({content:i});o.addListener("closeclick",function(){t.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png")}),t.addListener("click",function(){map.setCenter(t.position),o.open(map,t),t.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png"),t.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){t.setAnimation(null)},2e3)}),this.markerDict[e.id]=t,this.infowindowDict[e.id]=o},openWindow:function(e){var n=this.markerDict[e],t=this.infowindowDict[e];t.open(map,n),n.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png")},closeWindow:function(e){var n=this.markerDict[e],t=this.infowindowDict[e];t.close(map,n),n.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png")},bounceMarker:function(e){var n=this.markerDict[e];n.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){n.setAnimation(null)},2e3)},recenterMap:function(e){var n=this.markerDict[e];map.setCenter(n.position)},filterMarkers:function(e){var n=this,i=new Set;e.forEach(function(e){e.id;i.add(e.id)}),t.getVenueLocations().forEach(function(e){i.has(e.id)?n.markerDict[e.id].setMap(map):n.markerDict[e.id].setMap(null)})}},t={init:function(){e.init(),events=e.findEvents(),$.when(events).done(function(){e.processEvents(events),n.init(),i.init(),ko.applyBindings(i)}).fail(function(){$("#venue-header").text("Could not load venue data"),$(".filter").css({display:"none"})})},getVenueEventDict:function(){return e.venueEventDict},getVenueIDs:function(){return e.venueIDs},getVenueLocations:function(){return e.venueLocations}},i={items:ko.observableArray(),filter:ko.observable(""),currentVenue:ko.observable(),selectedVenueId:ko.observable(),init:function(){var n=this;e.venueLocations.forEach(function(e){n.items.push(e)})},setCurrentVenue:function(){i.currentVenue(this),i.selectedVenueId(this.id)}};t.init(),i.currentVenue.subscribe(function(e){e&&n.closeWindow(e.id)},null,"beforeChange"),i.currentVenue.subscribe(function(e){var t=e.id;n.openWindow(t),n.bounceMarker(t),n.recenterMap(t)}),i.filteredByName=ko.dependentObservable(function(){var e=function(e,n){return e.indexOf(n)>=0},t=this.filter().toLowerCase();if(t){var i=ko.utils.arrayFilter(this.items(),function(n){return e(n.name.toLowerCase(),t)});return n.filterMarkers(i),console.log(this.items().length),i}return n.filterMarkers(this.items()),this.items()},i)});