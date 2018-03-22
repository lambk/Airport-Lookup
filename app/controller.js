const model = require('./model.js');

let root = ''
exports.setRoot = function(rootP) {
  root = rootP;
}

exports.loadMainPage = function(req, res) {
  res.render(root + '/views/index.jade');
};

exports.loadAirportPage = function(req, res) {
  new Promise(function(resolve, reject) {
    model.callAirportApi(req.params.icao, function(airport_data) {
      resolve(airport_data);
    }, function(code, msg) {
      res.status(code).send(msg);
    }, function() {
      res.redirect('/invalid-airport');
    });
  }).then(function(airport_data) {
    return new Promise(function(resolve, reject) {
      model.callMetarApi(req.params.icao, function(metar_data) {
        resolve([airport_data, metar_data]);
      }, function(code, msg) {
        res.status(code).send(msg);
      }, function() {
        res.redirect('/invalid-airport');
      });
    });
  }).then(function(results) {
    let airport = results[0].data[0];
    let metar = results[1].data[0];
    res.render(root + '/views/airport.jade', {
      title: airport.icao + ' - Airport Lookup',
      icao: airport.icao + ' - ' + airport.name,
      latitude: airport.latitude.decimal,
      longitude: airport.longitude.decimal,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone.tzid + ' (' + airport.timezone.gmt + ' GMT)',
      status: airport.status,
      metar: metar
    });
  });
};

exports.loadInvalidPage = function(req, res) {
  res.render(root + '/views/invalid.jade');
};
