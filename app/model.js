const request = require('request');

exports.callAirportApi = function(icao, done, failure) {
  console.log('Fetching Airport Data for ' + icao + ' from CheckWx');
  let options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    },
    'Content-Type': 'application/json'
  }
  request(options, function(err, response, body) {
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        done(data);
      } catch(e) {
        console.log(e);
        failure(500, 'Internal server error');
      }
    } else {
      console.log(err);
      failure(500, 'Internal server error');
    }
  });
}

exports.callMetarApi = function(icao, done, failure) {
  console.log('Fetching Metar for ' + icao + ' from CheckWx');
  let options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  request(options, function(err, response, body) {
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        done(data);
      } catch(e) {
        console.log(e);
        failure(500, 'Internal server error');
      }
    } else {
      console.log(err);
      failure(500, 'Internal server error');
    }
  });
}
