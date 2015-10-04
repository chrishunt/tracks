(function () {
  'use strict';

  function filesFromURL () {
    return window.location.search.replace("?","").split("&");
  }

  function loadGPX(map, filename) {
    $.ajax({url: filename,
      dataType: "xml",
      success: function(data) {
        var parser = new GPXParser(data, map);
        parser.setTrackColour("#ff0000");
        parser.setTrackWidth(5);
        parser.setMinTrackPointDelta(0.001);
        parser.centerAndZoom(data);
        parser.addTrackpointsToMap();
        parser.addWaypointsToMap();
      }
    });
  }

  $(document).ready(function() {
    var files = filesFromURL();

    var mapOptions = {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

    for (var i = 0; i < files.length; i++) {
      loadGPX(map, "gpx/" + files[i] + ".GPX");
    }
  });
}());
