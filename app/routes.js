const controller = require('./controller');
const userController = require('./userController');

module.exports = function(app, root) {
  controller.setRoot(root);

  app.get('/', controller.loadMainPage);

  app.get('/airport/:icao', controller.loadAirportPage);

  app.get('/invalid-airport', controller.loadInvalidPage);

  app.post('/users', userController.createUser);

  app.post('/login', userController.login);

  app.post('/logout', userController.logout);

  app.get('/auth', userController.authorize);

  app.get('/users/favourites', userController.getFavourites);

  app.post('/users/favourites', userController.addFavourite);
}
