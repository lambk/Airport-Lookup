const model = require('./model.js');

let root = ''
exports.setRoot = function(rootP) {
  root = rootP;
}

exports.loadMainPage = function(req, res) {
  model.loadPage(root + '/views/index.html', res);
};

exports.loadAirportPage = function(req, res) {
  model.loadPage(root + '/views/airport.html', res);
};

exports.loadInvalidPage = function(req, res) {
  model.loadPage(root + '/views/invalid.html', res);
};

exports.fetchAirportData = function(req, res) {
  var icao = req.params.icao;
  var options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  model.callAirportApi(icao, options, res);
};

exports.fetchMetarData = function(req, res) {
  var icao = req.params.icao;
  var options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  model.callMetarApi(icao, options, res);
};
