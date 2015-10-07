(function () {
  'use strict';

  L.mapbox.accessToken = 'pk.eyJ1IjoiY2hyaXNodW50IiwiYSI6ImNpZmU1ZWZwNjZoMWhzeWx4cXE4NzNnNncifQ.dUBxoDUgW3vUAM6Fw8p84Q';

  var map = L.mapbox.map("map", "mapbox.streets"),
      trackLayerGroup = L.layerGroup().addTo(map);

  L.control.layers({
    "Street": map.tileLayer,
    "Satellite": L.mapbox.tileLayer("mapbox.satellite")
  }, null).addTo(map);

  // Returns track files and colors from the URL.
  //
  // Tracks can be shown for specific dates and colors:
  //
  //   map.html?2015-09-18&2015-09-20,a000f0
  //
  // Or for a date range:
  //
  //   map.html?2015-09-18..2015-09-20
  function tracksFromURL () {
    var params = window.location.search.replace("?","").split("&");
    var tracks = [];

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

    return tracks;
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

  // Fit map bounds to all track layers than have been loaded.
  function fitMapBounds() {
    var mapBounds = L.latLngBounds([]);

    trackLayerGroup.eachLayer(function (layer) {
      mapBounds.extend(layer.getBounds());
    });

    map.fitBounds(mapBounds);
  }

  // Recursively load all tracks provided into map
  function loadTracks(i, tracks){
    var date  = tracks[i].date,
        file  = tracks[i].file,
        color = tracks[i].color;

    var runLayer = omnivore.gpx(file, null, customLayer(color))
      .on("ready", function() {
        runLayer.addTo(trackLayerGroup);
        runLayer.bindPopup(date);

        runLayer.on("click", function() {
          map.fitBounds(runLayer.getBounds());
        });

        if (i == tracks.length-1) { fitMapBounds(); }
      })
      .on("error", function() {
        if (i == tracks.length-1) { fitMapBounds(); }
      });

    if (i < tracks.length-1) { loadTracks(i+1, tracks); }
  }

  loadTracks(0, tracksFromURL());
})();
