/*
 * Adapted from original code created by Thomas Zinnbauer YMC AG  |  http://www.ymc.ch
 */

$(document).ready(function () {

    var $wrapper = $('#wrapper');
    var $wrapperLayer = $('#wrapperLayer');
    var $container = $('#container');

    //Open the menu
    $("#hamburger").click(function () {


        $wrapper.css('min-height', $(window).height());

        $('nav').css('opacity', 1);

        //set the width of primary wrapper container -> wrapper should not scale while animating
        var contentWidth = $wrapper.width();

        //set the wrapper with the width that it has originally
        $wrapper.css('width', contentWidth);

        //display a layer to disable clicking and scrolling on the content while menu is shown
        $wrapperLayer.css('display', 'block');

        //disable all scrolling on mobile devices while menu is shown
        $container.bind('touchmove', function (e) {
            e.preventDefault()
        });

        $container.animate({
            "marginLeft": "70%"
        }, {
            duration: 700,
            easing: "linear"
        });

    });

    //close the menu
    $wrapperLayer.click(function () {


        //enable all scrolling on mobile devices when menu is closed
        $container.unbind('touchmove');

        //set margin for the whole container back to original state with a $ UI animation
        $container.animate({
            "marginLeft": "-1"
        }, {
            duration: 700,
            easing: "linear",
            complete: function () {
                $wrapper.css('width', 'auto');
                $wrapperLayer.css('display', 'none');
                $('nav').css('opacity', 0);
                $wrapper.css('min-height', 'auto');
            }
        })
    });

});