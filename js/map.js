(function () {
  'use strict';

  L.mapbox.accessToken = 'pk.eyJ1IjoiY2hyaXNodW50IiwiYSI6ImNpZmU1ZWZwNjZoMWhzeWx4cXE4NzNnNncifQ.dUBxoDUgW3vUAM6Fw8p84Q';

  var map = L.mapbox.map("map", "mapbox.streets", {
        attributionControl: false
      }).setView([45.54, -122.65], 5),
      trackLayerGroup = L.layerGroup().addTo(map),
      noPhotos = false,
      tracks = {};

  L.control.layers({
    "Street": map.tileLayer,
    "Satellite": L.mapbox.tileLayer("mapbox.satellite"),
    "Hybrid": L.mapbox.tileLayer("mapbox.streets-satellite")
  }, null).addTo(map);

  // Hide the loading image
  function hideLoader() {
    document.getElementById('loader').className = 'hide';
  }

  // Loads track dates and colors from the URL.
  //
  // Tracks can be shown for specific dates and colors:
  //
  //   map.html?2015-09-18&2015-09-20,a000f0
  //
  // Or for a date range:
  //
  //   map.html?2015-09-18..2015-09-20
  //
  // Or just show me everything:
  //
  //   map.html?all
  //
  // And if you don't want photos:
  //
  //   map.html?2015-09-18..2015-09-20&nophotos
  function loadTracksFromURL () {
    var params = window.location.search.replace("?","").split("&");
    tracks = {};

    for (var i = 0; i < params.length; i++) {
      if(params[i] == "nophotos") { noPhotos = true; continue; }

      var track = params[i].split(","),
          color = track[1],
          range;

      if (track[0] == "all") {
        range = ["2015-03-25", moment().format("YYYY-MM-DD")];
      } else {
        range = parseDateRange(track[0]);
      }

      moment.range(range).by("days", function(date) {
        tracks[date.format("YYYY-MM-DD")] = {
          file: "gpx/" + date.format("YYYY-MM-DD") + ".gpx",
          color: "#" + (color || randomColor({luminosity: "dark"})),
        };
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
  function fitMapBounds() {
    var mapBounds = L.latLngBounds([]);

    trackLayerGroup.eachLayer(function (layer) {
      mapBounds.extend(layer.getBounds());
    });

    map.fitBounds(mapBounds);
  }


  // Returns true if all the tracks have been loaded into the map
  function tracksDoneLoading(){
    return trackLayerGroup.getLayers().length == Object.keys(tracks).length;
  }

  // Adjust the bounds of the map to fit all the loaded tracks and show photos
  function presentMap() {
    if (tracksDoneLoading()) {
      hideLoader();
      fitMapBounds();
      loadPhotos();
    }
  }

  // Recursively draw all tracks onto the map.
  function drawTracksOnMap(i, dates){
    i = i || 0;
    dates = dates || Object.keys(tracks);

    var date = dates[i];

    if (!date) { return; }

    var file  = tracks[date].file,
        color = tracks[date].color;

    var runLayer = omnivore.gpx(file, null, customLayer(color))
      .on("ready", function() {
        runLayer.addTo(trackLayerGroup);

        runLayer.eachLayer(function (layer) {
          layer.bindPopup(
            "<b>" + layer.feature.properties.name + "</b><br/>" +
            "<a href='map.html?" + date + "' target='_blank'>🔎 View</a><br/>" +
            "<a href='" + file + "' target='_blank'>💾 Download</a>"
          );
        });

        presentMap();
      })
      .on("error", function() {
        runLayer.addTo(trackLayerGroup);
        presentMap();
      });

    drawTracksOnMap(i+1, dates);
  }

  // Load all photos onto the map as markers
  function loadPhotos(){
    if(noPhotos) { return; }

    var photoLayer = L.mapbox.featureLayer().addTo(map),
        geoJson = [];

    for (var i = 0; i < photoList.length; i++) {
      var date = photoList[i].filename.slice(0,10);

      if (tracks[date]) {
        geoJson.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": photoList[i].coordinates
          },
          "properties": {
            "filename": photoList[i].filename
          }
        });
      }
    }

    photoLayer.on('layeradd', function(e) {
      var marker = e.layer,
          feature = marker.feature;

      var content = '<img width="200px" src="photos/' +
        feature.properties.filename + '"/><br/>' +
        '<a href="https://instagram.com/huntca" target="_blank">📷 instagram/huntca</a>';

      marker.bindPopup(content ,{
        closeButton: false,
        minWidth: 220
      });

      marker.setIcon(L.icon({
        "iconUrl": "photos/" + feature.properties.filename,
        "iconSize": [50, 50],
        "iconAnchor": [25, 25],
        "popupAnchor": [0, -25],
        "className": "dot"
      }));
    });

    photoLayer.setGeoJSON(geoJson);
  }

  loadTracksFromURL();
  drawTracksOnMap();
})();
