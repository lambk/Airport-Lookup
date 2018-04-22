const model = require('./model.js');
const crypto = require('crypto');

/*
 * Creates a new user with the given username and password.
 * A random user salt is also generated for the new account
 */
exports.createUser = function(req, res) {
  /* Input validation */
  if (req.body.username == undefined) return res.status(400).send('No username provided');
  if (!/^[A-Za-z0-9]{3,50}$/.test(req.body.username)) return res.status(400).send('Username can only contain alphanumeric characters');
  if (req.body.password == undefined) return res.status(400).send('No password provided');
  if (req.body.password.length < 8) return res.status(400).send('Password must be 8 or more characters long');
  new Promise((resolve, reject) => {
    const salt_gen = crypto.randomBytes(32, function(err, buff) { //Generating a user salt
      if (err) return res.status(500).send('Error generating user salt');
      resolve(buff);
    });
  }).then(salt_obj => {
    let salt = salt_obj.toString('hex');
    const pw_hasher = crypto.createHash('sha256');
    let pw = pw_hasher.update(req.body.password + salt).digest('hex'); //Hashing the password + salt
    model.addUser([req.body.username, pw, salt], (code, msg) => {
      res.status(code).send(msg);
    });
  });
};

exports.authorize = function(req, res) {
  if (req.cookies.token == undefined) return res.status(401).send('No token');
  new Promise((resolve, reject) => {
    model.readUserByToken(req.cookies.token, (result) => { //Fetching users with a matching login token
      resolve(result);
    }, (code, msg) => {
      res.status(code).send(msg);
    });
  }).then((rows) => {
    if (rows.length == 0) { //The token doesn't match any tokens in the database (Likely for a user that has had the token updated)
      res.clearCookie('token');
      return res.status(401).send('No matching token');
    }
    return res.status(200).send(rows[0].username); //Return the username of the logged in user
  });
};

/*
 * Fetches account information from the database and checks if the
 * provided password + the salt from the db matches the password in the database.
 * If the password matches, a user token is generated, stored into the database, and given to the user for future actions.
 */
exports.login = function(req, res) {
  if (req.body.username == undefined) return res.status(400).send('No username provided');
  if (req.body.password == undefined) return res.status(400).send('No password provided');
  new Promise((resolve, reject) => {
    model.readUser(req.body.username, (result) => {
      resolve(result);
    }, (code, msg) => {
      res.status(code).send(msg);
    });
  }).then((rows) => {
    return new Promise((resolve, reject) => {
      if (rows.length == 0) return res.status(401).send('Invalid username + password combination'); //No user with the username - Give generic user+pw combination error for security reasons
      if (crypto.createHash('sha256').update(req.body.password + rows[0].salt).digest('hex') == rows[0].password) {
        const token_gen = crypto.randomBytes(32, (err, buff) => { //Generating the user token
          if (err) return res.status(500).send('Error generating user token');
          resolve(buff);
        });
      } else {
        res.status(401).send('Invalid username + password combination');
      }
    });
  }).then((token_obj) => {
    model.addUserToken([token_obj.toString('hex'), req.body.username], (token) => {
      res.cookie('token', token, {maxAge: 360000, httpOnly: false}); //Issuing the login token
      res.status(200).send(req.body.username);
    }, (code, msg) => {
      res.status(code).send(msg);
    });
  });
};

exports.logout = function(req, res) {
  if (req.cookies.token == undefined) return res.status(400).send('No token provided');
  model.removeUserToken(req.cookies.token, (code, msg) => {
    res.clearCookie('token'); //Revoking the login token
    res.status(code).send(msg);
  }, (code, msg) => {
    res.status(code).send(msg);
  });
};

exports.getFavourites = function(req, res) {
  let token = req.cookies.token;
  model.readFavourites(token, (rows) => {
    let favourites = rows.map((row) => row.airport);
    res.status(200).send(favourites);
  }, (code, msg) => {
    res.status(code).send(msg);
  });
}
