(function () {
  'use strict';

  // Returns track filenames and colors from the URL.
  //
  // Url should be in the form:
  //
  //   map.html?2015-09-18&2015-09-20,a000f0
  function tracksFromURL () {
    return window.location.search.replace("?","").split("&");
  }

  // Returns layer style in the provided color.
  //
  // http://leafletjs.com/reference.html#geojson-style
  function customLayer(color) {
    return L.geoJson(null, {
      style: function(feature) {
        return {
          color: color,
          weight: 5,
          opacity: 0.8
        };
      }
    });
  }

  L.mapbox.accessToken = 'pk.eyJ1IjoiY2hyaXNodW50IiwiYSI6ImNpZmU1ZWZwNjZoMWhzeWx4cXE4NzNnNncifQ.dUBxoDUgW3vUAM6Fw8p84Q';
  var map = L.mapbox.map("map", "mapbox.streets");
  var tracks = tracksFromURL();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i].split(","),
      file  = "/gpx/" + track[0] + ".gpx",
      color = "#" + (track[1] || "ff0000");

    var runLayer = omnivore.gpx(file, null, customLayer(color))
      .on("ready", function() {
        map.fitBounds(runLayer.getBounds());
      })
    .addTo(map);
  }
})();
