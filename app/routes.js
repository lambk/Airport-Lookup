const controller = require('./controller');

module.exports = function(app, root) {
  controller.setRoot(root);

  app.get('/', controller.loadMainPage);

  app.get('/airport/:icao', controller.loadAirportPage);

  app.get('/invalid-airport', controller.loadInvalidPage);

  app.post('/create', controller.createUser);

  app.post('/login', controller.login);

  app.post('/logout', controller.logout);

  app.get('/auth', controller.authorize);
}
