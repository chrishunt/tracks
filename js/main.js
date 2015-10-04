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
  var mapOptions = {
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"),
      mapOptions);
  loadGPX(map, "gpx/2015-10-02.GPX");
  loadGPX(map, "gpx/2015-10-03.GPX");
});
