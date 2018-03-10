const controller = require('./controller');

module.exports = function(app, root) {
  controller.setRoot(root);

  app.route('/')
    .get(controller.loadMainPage);

  app.route('/airport/:icao')
    .get(controller.loadAirportPage);

  app.route('/invalid-airport')
    .get(controller.loadInvalidPage);

  app.route('/api/airport/:icao')
    .get(controller.fetchAirportData);

  app.route('/api/metar/:icao')
    .get(controller.fetchMetarData);
}
