(function () {
  'use strict';

  // Url should be in the form:
  //
  //   map.html?2015-09-18&2015-09-20,a000f0
  function tracksFromURL () {
    return window.location.search.replace("?","").split("&");
  }

  function loadGPX(map, filename, color) {
    $.ajax({url: filename,
      dataType: "xml",
      success: function(data) {
        var parser = new GPXParser(data, map);
        parser.setTrackColour(color);
        parser.setTrackWidth(5);
        parser.setMinTrackPointDelta(0.001);
        parser.centerAndZoom(data);
        parser.addTrackpointsToMap();
        parser.addWaypointsToMap();
      }
    });
  }

  $(document).ready(function() {
    var tracks = tracksFromURL();

    var mapOptions = {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i].split(","),
          file  = track[0],
          color = (track[1] || "ff0000");

      loadGPX(map, "gpx/" + file + ".gpx", "#" + color);
    }
  });
}());
