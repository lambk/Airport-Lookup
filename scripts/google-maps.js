$(function () {
  loadMap(parseFloat($('#latitude').html()), parseFloat($('#longitude').html()));
});

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
