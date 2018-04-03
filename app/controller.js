const model = require('./model.js');

let root = ''
exports.setRoot = function(rootP) {
  root = rootP;
}

exports.loadMainPage = function(req, res) {
  res.render(root + '/views/index.jade');
};

exports.loadInvalidPage = function(req, res) {
  res.render(root + '/views/invalid.jade');
};

exports.loadAirportPage = function(req, res) {
  let data = undefined;
  fetchAirportCache(req.params.icao.toUpperCase())
  .then(handleAirportCache)
  .then(function(airport) {
    data = {
      title: airport.icao + ' - Airport Lookup',
      icao: airport.icao + ' - ' + airport.name,
      latitude: airport.latitude.decimal,
      longitude: airport.longitude.decimal,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone.tzid + ' (' + airport.timezone.gmt + ' GMT)',
      status: airport.status
    }
    return airport.icao;
  })
  .then(fetchMetarCache)
  .then(handleMetarCache)
  .then(function(metar) {
    data.metar = metar.metar;
    res.render(root + '/views/airport.jade', data);
  })
  .catch(function(exception) {
    if (exception.type == 'redirect') {
      res.redirect(exception.data);
    } else if (exception.type == 'error') {
      console.log('ERROR: [' + exception.code + '] ' + exception.msg);
      res.status(exception.code).send(exception.msg);
    }
  });
};

function fetchAirportCache(icao) {
  return new Promise(function(resolve, reject) {
    model.getAirportCache(icao, function(data) {
      resolve({icao: icao, data: data});
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg}); //In the case that the server couldn't read from the database
    });
  });
}

function fetchMetarCache(icao) {
  return new Promise(function(resolve, reject) {
    model.getMetarCache(icao, function(data) {
      resolve({icao: icao, data: data});
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg}); //In the case that the server couldn't read from the database
    })
  })
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

function handleMetarCache(result) {
  return new Promise(function(resolve, reject) {
    let icao = result.icao;
    let rows = result.data;
    if (rows == undefined || rows.length == 0) {
      callMetarApi(icao).then(addMetarCache).then(function(data) {
        resolve(data);
      }).catch(function(exception) {
        reject(exception);
      });
    } else {
      if (rows[0].current_time > rows[0].expiry) {
        deleteMetarCache(rows[0].icao).then(callMetarApi).then(addMetarCache).then(function(data) {
          resolve(data);
        }).catch(function(exception) {
          reject(exception);
        });
      } else {
        let formatted_data = {
          icao: rows[0].icao,
          metar: rows[0].metar
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

function deleteMetarCache(icao) {
  return new Promise(function(resolve, reject) {
    model.deleteMetarCache(icao, function(result) {
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

function callMetarApi(icao) {
  return new Promise(function(resolve, reject) {
    model.callMetarApi(icao, function(result) {
      resolve({icao: icao, metar: result});
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg});
    }, function() {
      reject({type: 'redirect', data: '/invalid-airport'});
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

function addMetarCache(api_data) {
  /* Prevents adding the metar cache if the metar is unavailable
   * Subsequent page loads will call the api incase the data is now available
   */
  if (api_data.metar.endsWith("METAR Currently Unavailable")) {
    return api_data;
  }
  let sql_data = [
    api_data.icao, api_data.metar
  ];
  return new Promise(function(resolve, reject) {
    model.addMetarCache(sql_data, function() {
      resolve(api_data);
    }, function(code, msg) {
      reject({type: 'error', code: code, msg: msg});
    });
  });
}
