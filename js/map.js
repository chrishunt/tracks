(function () {
  'use strict';

  L.mapbox.accessToken = 'pk.eyJ1IjoiY2hyaXNodW50IiwiYSI6ImNpZmU1ZWZwNjZoMWhzeWx4cXE4NzNnNncifQ.dUBxoDUgW3vUAM6Fw8p84Q';

  var map = L.mapbox.map("map", "mapbox.streets", {
        attributionControl: false
      }).setView([45.54, -122.65], 5),
      trackLayerGroup = L.layerGroup().addTo(map),
      tracks = [];

  L.control.layers({
    "Street": map.tileLayer,
    "Satellite": L.mapbox.tileLayer("mapbox.satellite")
  }, null).addTo(map);

  // Loads track dates and colors from the URL.
  //
  // Tracks can be shown for specific dates and colors:
  //
  //   map.html?2015-09-18&2015-09-20,a000f0
  //
  // Or for a date range:
  //
  //   map.html?2015-09-18..2015-09-20
  function loadTracksFromURL () {
    var params = window.location.search.replace("?","").split("&");
    tracks = [];

    for (var i = 0; i < params.length; i++) {
      var track = params[i].split(","),
          range = parseDateRange(track[0]),
          color = track[1];

      moment.range(range).by("days", function(date) {
        tracks.push({
          date: date.format("MMMM Do YYYY"),
          file: "gpx/" + date.format("YYYY-MM-DD") + ".gpx",
          color: "#" + (color || randomColor({luminosity: "dark"})),
        });
      });
    }
  }

  // Returns a date range in the form [start, end] given a String:
  //
  // "2015-10-03" or "2015-10-01..2015-10-05"
  function parseDateRange(input) {
    var dateRange = input.split("..");

    if(dateRange.length != 2) { dateRange = [dateRange[0], dateRange[0]]; }

    return dateRange;
  }

  // Returns layer style in the provided color.
  //
  // http://leafletjs.com/reference.html#geojson-style
  function customLayer(color) {
    return L.geoJson(null, {
      style: function() {
        return {
          color: color,
          weight: 5,
          opacity: 0.9
        };
      }
    });
  }

  // Fit map bounds to all track layers.
  //
  // This will do nothing if all the tracks have not been loaded.
  function fitMapBounds() {
    if (trackLayerGroup.getLayers().length == tracks.length) {
      var mapBounds = L.latLngBounds([]);

      trackLayerGroup.eachLayer(function (layer) {
        mapBounds.extend(layer.getBounds());
      });

      map.fitBounds(mapBounds);
    }
  }

  // Recursively draw all tracks onto the map.
  function drawTracksOnMap(i){
    i = i || 0;

    if (!tracks[i]) { return; }

    var date  = tracks[i].date,
        file  = tracks[i].file,
        color = tracks[i].color;

    var runLayer = omnivore.gpx(file, null, customLayer(color))
      .on("ready", function() {
        runLayer.addTo(trackLayerGroup);
        runLayer.bindPopup(date);
        fitMapBounds();
      })
      .on("error", function() {
        runLayer.addTo(trackLayerGroup);
        fitMapBounds();
      });

    drawTracksOnMap(i+1);
  }

  loadTracksFromURL();
  drawTracksOnMap();
})();
