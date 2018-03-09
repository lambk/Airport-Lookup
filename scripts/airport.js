$(function () {
  const icao = window.location.pathname.slice(9, 14).toUpperCase();
  getAirportData(icao);
  getMetar(icao);
});


function getAirportData(icao) {
  $.ajax({
    type: 'GET',
    url: '/api/airport/' + icao,
    contentType: 'application/json',
    success: function(data) {
      let airport = data.data[0];
      loadAirportData(airport);
      loadMap(airport.latitude.decimal, airport.longitude.decimal);
    },
    error: function(data) {
      console.log('Error with Airport Data call');
    }
  });
}

function getMetar(icao) {
  $.ajax({
    type: 'GET',
    url: '/api/metar/' + icao,
    contentType: 'application/json',
    success: function(data) {
      let metar = data.data[0];
      loadMetar(metar)
    },
    error: function(data) {
      console.log('Error with Metar call');
    }
  });
}

function loadAirportData(airport) {
  $('#title').html(airport.icao + ' - ' + airport.name);
  $('#latitude').html(airport.latitude.decimal);
  $('#longitude').html(airport.longitude.decimal);
  $('#city').html(airport.city);
  $('#country').html(airport.country);
  $('#timezone').html(airport.timezone.tzid);
  $('#status').html(airport.status);
}

function loadMap(lat, long) {
  var mapLocation = new google.maps.LatLng(lat, long);
  var mapOptions = {
    center: mapLocation,
    zoom: 13,
    mapTypeId: 'satellite'
  };

  var map = new google.maps.Map(document.getElementById('google-map'), mapOptions);

  setRecenterEventHandler(map, lat, long);
}

function setRecenterEventHandler(map, lat, long) {
  $('#recenterBtn').click(function () {
    map.setCenter(new google.maps.LatLng(lat, long));
    map.setZoom(13);
  });
}

function loadMetar(metar) {
  $('#metar').html(metar);
}
