const request = require('request');

exports.loadPage = function(file, res) {
  res.sendFile(file);
};

exports.callAirportApi = function(icao, options, res) {
  console.log('Fetching Airport Data for ' + icao + ' from CheckWx');
  request(options, function(err, response, body) {
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      var airport_data = JSON.parse(response.body);
      res.send(airport_data);
    } else {
      console.log(err);
      res.send({'ERROR' : err});
    }
  });
}

exports.callMetarApi = function(icao, options, res) {
  console.log('Fetching Metar for ' + icao + ' from CheckWx');
  request(options, function(err, response, body) {
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      var metar_data = JSON.parse(response.body);
      res.send(metar_data);
    } else {
      console.log(err);
      res.send({'ERROR' : err});
    }
  });
}
