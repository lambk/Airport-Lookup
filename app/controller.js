const model = require('./model.js');

let root = ''
exports.setRoot = function(rootP) {
  root = rootP;
}

exports.loadMainPage = function(req, res) {
  res.render(root + '/views/index.jade');
};

exports.loadAirportPage = function(req, res) {
  fetchAirportCache(req.params.icao)
  .then(handleAirportCache)
  .then(function(airport) {
    res.render(root + '/views/airport.jade', {
      title: airport.icao + ' - Airport Lookup',
      icao: airport.icao + ' - ' + airport.name,
      latitude: airport.latitude.decimal,
      longitude: airport.longitude.decimal,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone.tzid + ' (' + airport.timezone.gmt + ' GMT)',
      status: airport.status
    });
  }).catch(function(exception) {
    if (exception.type == 'redirect') {
      res.redirect(exception.data);
    } else if (exception.type == 'error') {
      console.log('ERROR: [' + exception.code + '] ' + exception.msg);
      res.status(exception.code).send(exception.msg);
    }
  });
}

function fetchAirportCache(icao) {
  return new Promise(function(resolve, reject) {
    model.getAirportCache(icao, function(data) {
      resolve({icao: icao, data: data});
    }, function(code, msg) {
      reject({type: 'error', code: code, msg:msg}); //In the case that the server couldn't read from the database
    });
  });
}

function handleAirportCache(result) {
  return new Promise(function(resolve, reject) {
    let icao = result.icao;
    let rows = result.data;
    if (rows == undefined || rows.length == 0) {
      callAirportApi(icao).then(addAirportCache).then(function(data) {
        resolve(data);
      }).catch(function(exception) {
        reject(exception);
      });
    } else {
      if (rows[0].current_time > rows[0].expiry) {
        deleteAirportCache(rows[0].icao).then(callAirportApi).then(addAirportCache).then(function(data) {
          resolve(data);
        }).catch(function(exception) {
          reject(exception);
        });
      } else {
        let formatted_data = {
          icao: rows[0].icao,
          name: rows[0].title,
          latitude: {
            decimal: rows[0].latitude
          },
          longitude: {
            decimal: rows[0].longitude
          },
          city: rows[0].city,
          country: rows[0].country,
          timezone: {
            tzid: rows[0].timezone_tzid,
            gmt: rows[0].timezone_gmt
          },
          status: rows[0].status
        };
        resolve(formatted_data);
      }
    }
  });
}

function deleteAirportCache(icao) {
  return new Promise(function(resolve, reject) {
    model.deleteAirportCache(icao, function(result) {
      resolve(icao);
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg});
    });
  });
}

function callAirportApi(icao) {
  return new Promise(function(resolve, reject) {
    model.callAirportApi(icao, function(result) {
      resolve(result);
    }, function(code, msg) {
      reject('Error calling airport api');
    }, function() {
      reject({ type: 'redirect', data: '/invalid-airport' });
    });
  });
}

function addAirportCache(api_data) {
  let sql_data = [
    api_data.icao, api_data.name, api_data.latitude.decimal, api_data.longitude.decimal,
    api_data.city, api_data.country, api_data.timezone.tzid, api_data.timezone.gmt, api_data.status
  ];
  return new Promise(function(resolve, reject) {
    model.addAirportCache(sql_data, function() {
      resolve(api_data);
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg});
    });
  });
}

exports.loadInvalidPage = function(req, res) {
  res.render(root + '/views/invalid.jade');
};
