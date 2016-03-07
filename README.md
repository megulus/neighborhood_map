# Project 5: Neighborhood Map


### Overview

The app displays a Google Map (centered on Brooklyn) showing venues (concert, theater and sports). Infowindows for the venues give location information and information about upcoming events. 

### Running the App

The app can be run in the browser in two ways:

1. From the browser, navigate to the "build/index.html" file within the project directory.

2. Run a simple HTTP server from the project's "build" directory, and then navigate to localhost within the browser.


### Using the App

Information for the venues on the map can be opened in two ways:

1. The user can click directly on the map icons, which will re-center the map on that venue and open its infowindow. The infowindow will remain open unless the user closes it.

2. The user can click on events in the list in the sidebar. When a venue name is clicked on, its infowindow will open. If the user then clicks on another venue name, the previous infowindow will close.

The venue list in the sidebar can be filtered by entering text into the filter text area. The list will then display only venues whose names include the entered text.

### Mobile UI

In the mobile view, the list and filter search bar are hidden until accessed via a hamburger menu.

### Future bug fixes

Currently, there is a bug in the hamburger menu behavior: if the viewport size is increased while the hamburger menu is open, a duplicate menue appears. Since this only happens when the hamburger menu is open during a viewport re-sizing, this is likely to be encountered relatively infrequently. However, it is something that I would want to fix if I were to make the app more robust in the future.


### APIs Used

[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial)
[Seatgeek](platform.seatgeek.com)





### Acknowledgements

I used the filteredItems code from [this blog post](http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html) as inspiration for my filteredByName function. This [jsfiddle](http://jsfiddle.net/rniemeyer/vdcUA/) was also very helpful. The 'stringStartsWith' utility function I found on [this stackoverflow post](http://stackoverflow.com/questions/28042344/filter-using-knockoutjs). I adapted a [hamburger menu](https://github.com/ymc-thzi/mobile-menu-hamburger) template from code written by Thomas Zinnbauer.

