const db = require('../db');
const request = require('request');
const logger = require('./logger.js');

exports.getAirportCache = function(icao, done, failure) {
  db.get_pool().query('SELECT *, NOW() AS \'current_time\' FROM airport_cache WHERE icao=?', icao, function(err, rows) {
    if (err) return failure(500, 'Error reading from airport cache');
    if (rows.length > 0) logger.log(logger.TYPE.AIRPORT, `Airport cache fetched for ${icao}`);
    return done(rows);
  });
};

exports.getMetarCache = function(icao, done, failure) {
  db.get_pool().query('SELECT *, NOW() AS \'current_time\' FROM metar_cache WHERE icao=?', icao, function(err, rows) {
    if (err) return failure(500, 'Error reading from metar cache');
    if (rows.length > 0) logger.log(logger.TYPE.METAR, `Metar cache fetched for ${icao}`);
    return done(rows);
  });
};

exports.deleteAirportCache = function(icao, done, failure) {
  db.get_pool().query('DELETE FROM airport_cache WHERE icao=?', icao, function(err, result) {
    if (err) return failure(500, 'Error deleting from airport cache');
    logger.log(logger.TYPE.AIRPORT, `Airport cache deleted for ${icao}`);
    return done(result);
  });
};

exports.deleteMetarCache = function(icao, done, failure) {
  db.get_pool().query('DELETE FROM metar_cache WHERE icao=?', icao, function(err, result) {
    if (err) return failure(500, 'Error deleting from metar cache');
    logger.log(logger.TYPE.METAR, `Metar cache deleted for ${icao}`);
    return done(result);
  });
};

exports.addAirportCache = function(data, done, failure) {
  db.get_pool().query('INSERT INTO airport_cache (icao, title, latitude, longitude, elevation, magnetic, city, state, country, timezone_tzid, timezone_gmt, `status`, `usage`) \
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', data, function(err, result) {
    if (err) return failure(500, 'Error inserting into airport cache');
    logger.log(logger.TYPE.AIRPORT, `[CACHE] Airport cache added for ${data[0]}`);
    return done(result);
  });
};

exports.addMetarCache = function(data, done, failure) {
  db.get_pool().query('INSERT INTO metar_cache (icao, metar) VALUES (?,?)', data, function(err, result) {
    if (err) return failure(500, 'Error inserting into metar cache');
    logger.log(logger.TYPE.METAR, `[CACHE] Metar cache added for ${data[0]}`);
    return done(result);
  });
};

exports.callAirportApi = function(icao, done, failure, redirect) {
  logger.log(logger.TYPE.API, `Fetching Airport Data for ${icao} from CheckWx`);
  let options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    },
    'Content-Type': 'application/json'
  }
  request(options, function(err, response, body) {
    logger.log(logger.TYPE.API, `Response code: ${response.statusCode}`);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        if (data.data[0].icao == undefined) return redirect();
        done(data.data[0]);
      } catch(e) {
        logger.log(logger.TYPE.ERROR, 'Error converting API response to JSON');
        failure(500, 'Internal server error');
      }
    } else {
      logger.log(logger.TYPE.ERROR, `${response.statusCode} response from API`);
      failure(500, 'Internal server error');
    }
  });
}

exports.callMetarApi = function(icao, done, failure, redirect) {
  logger.log(logger.TYPE.API, `Fetching metar for ${icao} from CheckWx`);
  let options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    }
  }
  request(options, function(err, response, body) {
    logger.log(logger.TYPE.API, `Response code: ${response.statusCode}`);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        if (data.data[0].endsWith('Invalid Station ICAO')) return redirect();
        done(data.data[0]);
      } catch(e) {
        logger.log(logger.TYPE.ERROR, 'Error converting API response to JSON');
        failure(500, 'Internal server error');
      }
    } else {
      logger.log(logger.TYPE.ERROR, `${response.statusCode} response from API`);
      failure(500, 'Internal server error');
    }
  });
}
