const model = require('./model.js');
const cache = require('./cache.js');

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

/*
 * Loads information for the airport page using api & cached data
 */
exports.loadAirportPage = function(req, res) {
  let data = undefined; //Start with a function-scope empty object
  //Grabbing airport data from the cache or api
  cache.fetchAirportCache(req.params.icao.toUpperCase())
    .then(function(result) {
      return cache.handleAirportCache(result, callAirportApi);
    }).then(function(airport) {
      //Add airport data to the data object
      data = {
        title: airport.icao + ' - Airport Lookup',
        icao: airport.icao + ' - ' + airport.name,
        latitude: airport.latitude.decimal,
        longitude: airport.longitude.decimal,
        elevation: airport.elevation.feet,
        magnetic: airport.magnetic_variation,
        city: airport.city,
        state: airport.state,
        country: airport.country,
        timezone: airport.timezone.tzid + ' (' + airport.timezone.gmt + ' GMT)',
        status: airport.status,
        usage: airport.useage
      };
      return airport.icao;
    })
    //Grabbing metar data from the cache or api
    .then(cache.fetchMetarCache)
    .then(function(result) {
      return cache.handleMetarCache(result, callMetarApi);
    }).then(function(metar) {
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
