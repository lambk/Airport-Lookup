$(function () {
  const icao = window.location.pathname.slice(9, 14).toUpperCase();
  $('#fetch').click(function() {
    getAirportData(icao);
    getMetar(icao);
  })
  //getAirportData(icao);
  //getMetar(icao);
  //-37.010516,174.787814

  function getAirportData(icao) {
    $.ajax({
      type: 'GET',
      url: '/api/airport/' + icao,
      contentType: 'application/json',
      success: function(data) {
        loadAirportData(data);
      },
      error: function(data) {
        console.log('Error with Airport Data call')
      }
    });
  }

  function getMetar(icao) {
    $.ajax({
      type: 'GET',
      url: '/api/metar/' + icao,
      contentType: 'application/json',
      success: function(data) {
        loadMetar(data);
      },
      error: function(data) {
        console.log('Error with Metar call');
      }
    });
  }

  function loadAirportData(data) {
    var airport = data.data[0];
    console.log(airport);
    $('#title').html(airport.icao + ' - ' + airport.name);
    $('#latitude').html(airport.latitude.decimal);
    $('#longitude').html(airport.longitude.decimal);
    $('#city').html(airport.city);
    $('#country').html(airport.country);
    $('#timezone').html(airport.timezone.tzid);
    $('#status').html(airport.status);
  }

  function loadMetar(data) {
    var metar = data.data[0];
    $('#metar').html(metar);
  }
});
