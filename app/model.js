const request = require('request');
const db = require('../db');
const crypto = require('crypto');

exports.addUser = function(data, done) {
  db.get_pool().query('INSERT INTO users(username, password, salt) VALUES(?,?,?)', data, (err, result) => {
    if (err) {
      if (err.code == 'ER_DUP_ENTRY') return done(500, `Account ${data[0]} already exists`);
      return done(500, 'Error inserting into users');
    }
    return done(201, `Account ${data[0]} created`);
  });
};

exports.readUser = function(username, done, failure) {
  db.get_pool().query('SELECT * FROM users WHERE username=?', username, (err, rows) => {
    if (err) return failure(500, 'Error reading from users');
    return done(rows);
  });
};

exports.readUserByToken = function(token, done, failure) {
  db.get_pool().query('SELECT * FROM users WHERE token=?', token, (err, rows) => {
    if (err) return failure(500, 'Error reading from users');
    return done(rows);
  });
};

exports.addUserToken = function(data, done, failure) {
  db.get_pool().query('UPDATE users SET token=? WHERE username=?', data, (err, result) => {
    if (err) return failure(500, 'Error adding user token');
    return done(data[0]);
  });
};

exports.removeUserToken = function(token, done, failure) {
  db.get_pool().query('UPDATE users SET token=NULL WHERE token=?', token, (err, result) => {
    if (err) return failure(500, 'Error removing user token');
    return done(200, 'User token removed');
  })
}

exports.getAirportCache = function(icao, done, failure) {
  db.get_pool().query('SELECT *, NOW() AS \'current_time\' FROM airport_cache WHERE icao=?', icao, function(err, rows) {
    if (err) return failure(500, 'Error reading from airport cache');
    if (rows.length > 0) console.log(`[CACHE] Airport data fetched for ${icao}`);
    return done(rows);
  });
};

exports.getMetarCache = function(icao, done, failure) {
  db.get_pool().query('SELECT *, NOW() AS \'current_time\' FROM metar_cache WHERE icao=?', icao, function(err, rows) {
    if (err) return failure(500, 'Error reading from metar cache');
    if (rows.length > 0) console.log(`[CACHE] Metar data fetched for ${icao}`);
    return done(rows);
  });
};

exports.deleteAirportCache = function(icao, done, failure) {
  db.get_pool().query('DELETE FROM airport_cache WHERE icao=?', icao, function(err, result) {
    if (err) return failure(500, 'Error deleting from airport cache');
    console.log(`[CACHE] Airport data deleted for ${icao}`);
    return done(result);
  });
};

exports.deleteMetarCache = function(icao, done, failure) {
  db.get_pool().query('DELETE FROM metar_cache WHERE icao=?', icao, function(err, result) {
    if (err) return failure(500, 'Error deleting from metar cache');
    console.log(`[CACHE] Metar data deleted for ${icao}`);
    return done(result);
  });
};

exports.addAirportCache = function(data, done, failure) {
  db.get_pool().query('INSERT INTO airport_cache (icao, title, latitude, longitude, city, country, timezone_tzid, timezone_gmt, status) \
  VALUES (?,?,?,?,?,?,?,?,?)', data, function(err, result) {
    if (err) return failure(500, 'Error inserting into airport cache');
    console.log(`[CACHE] Airport data added for ${data[0]}`);
    return done(result);
  });
};

exports.addMetarCache = function(data, done, failure) {
  db.get_pool().query('INSERT INTO metar_cache (icao, metar) VALUES (?,?)', data, function(err, result) {
    if (err) return failure(500, 'Error inserting into metar cache');
    console.log(`[CACHE] Metar data added for ${data[0]}`);
    return done(result);
  });
};

exports.callAirportApi = function(icao, done, failure, redirect) {
  console.log(`[API] Fetching Airport Data for ${icao} from CheckWx`);
  let options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    },
    'Content-Type': 'application/json'
  }
  request(options, function(err, response, body) {
    console.log(`[API] Response code: ${response.statusCode}`);
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
  console.log(`[API] Fetching metar for ${icao} from CheckWx`);
  let options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': process.env.CWX_Key
    }
  }
  request(options, function(err, response, body) {
    console.log(`[API] Response code: ${response.statusCode}`);
    if (response.statusCode == 200) {
      try {
        let data = JSON.parse(response.body);
        if (data.data[0].endsWith('Invalid Station ICAO')) return redirect();
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
