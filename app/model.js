const request = require('request');
const db = require('../db');

exports.getAirportCache = function(icao, done, failure) {
  db.get_pool().query('SELECT *, NOW() AS \'current_time\' FROM airport_cache WHERE icao=?', icao, function(err, rows) {
    if (err) return failure(500, 'Error reading from airport cache');
    if (rows.length > 0) console.log('[CACHE] Cache fetched for ' + icao);
    return done(rows);
  });
};

exports.deleteAirportCache = function(icao, done, failure) {
  db.get_pool().query('DELETE FROM airport_cache WHERE icao=?', icao, function(err, result) {
    if (err) return failure(500, 'Error deleting from airport cache');
    console.log('[CACHE] Cache deleted for ' + icao);
    return done(result);
  });
};

exports.addAirportCache = function(data, done, failure) {
  db.get_pool().query('INSERT INTO airport_cache (icao, title, latitude, longitude, city, country, timezone_tzid, timezone_gmt, status) \
  VALUES (?,?,?,?,?,?,?,?,?)', data, function(err, result) {
    if (err) return failure(500, 'Error inserting into airport cache');
    console.log('[CACHE] Cache added for ' + data[0].toLowerCase());
    return done(result);
  });
};

exports.callAirportApi = function(icao, done, failure, redirect) {
  console.log('[API] Fetching Airport Data for ' + icao + ' from CheckWx');
  let options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    },
    'Content-Type': 'application/json'
  }
  request(options, function(err, response, body) {
    console.log('[API] Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        if (data.data[0].icao == undefined) return redirect();
        done(data.data[0]);
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

exports.callMetarApi = function(icao, done, failure, redirect) {
  console.log('[API] Fetching Metar for ' + icao + ' from CheckWx');
  let options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    }
  }
  request(options, function(err, response, body) {
    console.log('[API] Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        if (data.data[0].endsWith('Invalid Station ICAO')) return redirect();
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
