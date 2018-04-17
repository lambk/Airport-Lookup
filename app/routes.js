const controller = require('./controller');
const userController = require('./userController');

module.exports = function(app, root) {
  controller.setRoot(root);

  app.get('/', controller.loadMainPage);

  app.get('/airport/:icao', controller.loadAirportPage);

  app.get('/invalid-airport', controller.loadInvalidPage);

  app.post('/user/signup', userController.createUser);

  app.post('/user/login', userController.login);

  app.post('/user/logout', userController.logout);

  app.post('/user/auth', userController.authorize);

  app.get('/user/favourites', userController.getFavourites);
}
