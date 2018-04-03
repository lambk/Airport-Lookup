const model = require('./model.js');

let root = ''
exports.setRoot = function(rootP) {
  root = rootP; //Used to provide an absolute path to jade files
}

exports.loadMainPage = function(req, res) {
  res.render(root + '/views/index.jade');
};

exports.loadInvalidPage = function(req, res) {
  res.render(root + '/views/invalid.jade');
};

exports.loadAirportPage = function(req, res) {
  let data = undefined; //Start with a function-scope empty object
  //Grabbing airport data from the cache or api
  fetchAirportCache(req.params.icao.toUpperCase())
    .then(handleAirportCache)
    .then(function(airport) {
      //Add airport data to the data object
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
    //Grabbing metar data from the cache or api
    .then(fetchMetarCache)
    .then(handleMetarCache)
    .then(function(metar) {
      //Add metar data to the data object
      data.metar = metar.metar;
      //Pass the full data and render the page
      res.render(root + '/views/airport.jade', data);
    })
    .catch(function(exception) {
      if (exception.type == 'redirect') {
        res.redirect(exception.data); //Redirect to the provided endpoint
      } else if (exception.type == 'error') {
        console.log('ERROR: [' + exception.code + '] ' + exception.msg);
        //Send the status code & message back to the client
        res.status(exception.code).send(exception.msg);
      }
    });
};

/*
 * Retreives the airport data from the database if it exists
 */
function fetchAirportCache(icao) {
  return new Promise(function(resolve, reject) {
    model.getAirportCache(icao, function(data) {
      resolve({
        icao: icao,
        data: data
      });
    }, function(code, msg) {
      //In the case that the server couldn't read from the database
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    });
  });
}

/*
 * Retrieves the metar data from the database if it exists
 */
function fetchMetarCache(icao) {
  return new Promise(function(resolve, reject) {
    model.getMetarCache(icao, function(data) {
      resolve({
        icao: icao,
        data: data
      });
    }, function(code, msg) {
      //In the case that the server couldn't read from the database
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    })
  })
}

/*
 * Analyses the database airport data from the database to determine whether an api call, and/or cache update is needed
 * Cases include:
 *  -No cache data -> Call api and cache the data in the database
 *  -Expired cache data -> Delete cache data, recall api and add the updated data to the database
 *  -Valid cache data -> Skip straight to loading the page using the cached data
 */
function handleAirportCache(result) {
  return new Promise(function(resolve, reject) {
    let icao = result.icao;
    let rows = result.data;
    if (rows == undefined || rows.length == 0) { //No cache data
      callAirportApi(icao).then(addAirportCache).then(function(data) {
        resolve(data);
      }).catch(function(exception) {
        reject(exception);
      });
    } else {
      if (rows[0].current_time > rows[0].expiry) { //Expired cache data
        deleteAirportCache(rows[0].icao).then(callAirportApi).then(addAirportCache).then(function(data) {
          resolve(data);
        }).catch(function(exception) {
          reject(exception);
        });
      } else { //Valid cache data
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

/*
 * Analyses the database metar data from the database to determine whether an api call, and/or cache update is needed
 * Cases include:
 *  -No cache data -> Call api and cache the data in the database
 *  -Expired cache data -> Delete cache data, recall api and add the updated data to the database
 *  -Valid cache data -> Skip straight to loading the page using the cached data
 */
function handleMetarCache(result) {
  return new Promise(function(resolve, reject) {
    let icao = result.icao;
    let rows = result.data;
    if (rows == undefined || rows.length == 0) { //No cache data
      callMetarApi(icao).then(addMetarCache).then(function(data) {
        resolve(data);
      }).catch(function(exception) {
        reject(exception);
      });
    } else {
      if (rows[0].current_time > rows[0].expiry) { //Expired cache data
        deleteMetarCache(rows[0].icao).then(callMetarApi).then(addMetarCache).then(function(data) {
          resolve(data);
        }).catch(function(exception) {
          reject(exception);
        });
      } else { //Valid cache data
        let formatted_data = {
          icao: rows[0].icao,
          metar: rows[0].metar
        };
        resolve(formatted_data);
      }
    }
  });
}

/*
 * Calls the model function to delete the cached airport record from the database
 */
function deleteAirportCache(icao) {
  return new Promise(function(resolve, reject) {
    model.deleteAirportCache(icao, function(result) {
      resolve(icao);
    }, function(code, msg) {
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    });
  });
}

/*
 * Calls the model function to delete the cached metar record from the database
 */
function deleteMetarCache(icao) {
  return new Promise(function(resolve, reject) {
    model.deleteMetarCache(icao, function(result) {
      resolve(icao);
    }, function(code, msg) {
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    });
  });
}

/*
 * Calls the model function to call the airport api
 */
function callAirportApi(icao) {
  return new Promise(function(resolve, reject) {
    model.callAirportApi(icao, function(result) {
      resolve(result);
    }, function(code, msg) {
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    }, function() {
      reject({
        type: 'redirect',
        data: '/invalid-airport'
      });
    });
  });
}

/*
 * Calls the model function to call the metar api
 */
function callMetarApi(icao) {
  return new Promise(function(resolve, reject) {
    model.callMetarApi(icao, function(result) {
      resolve({
        icao: icao,
        metar: result
      });
    }, function(code, msg) {
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    }, function() { //On non-existant icao
      reject({
        type: 'redirect',
        data: '/invalid-airport'
      });
    });
  });
}

/*
 * Calls the model function to add the provided data as a new airport cache record
 */
function addAirportCache(api_data) {
  let sql_data = [
    api_data.icao, api_data.name, api_data.latitude.decimal, api_data.longitude.decimal,
    api_data.city, api_data.country, api_data.timezone.tzid, api_data.timezone.gmt, api_data.status
  ];
  return new Promise(function(resolve, reject) {
    model.addAirportCache(sql_data, function() {
      resolve(api_data);
    }, function(code, msg) {
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    });
  });
}

/*
 * Calls the model function to add the provided data as a new metar cache record
 * Except when the metar record is an "METAR Unavailable" record, in which case
 * execution skips the model call
 */
function addMetarCache(api_data) {
  /* Prevents adding the metar cache if the metar is unavailable
   * Subsequent page loads will call the api incase the data is now available */
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
      reject({
        type: 'error',
        code: code,
        msg: msg
      });
    });
  });
}
