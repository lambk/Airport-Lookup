const userModel = require('./userModel.js');
const crypto = require('crypto');

/*
 * Checks that the provided token matches a user in the datbase.
 * If it does, the username is returned, if not, the promise is rejected.
 */
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    userModel.readUserByToken(token, (rows) => { //Fetching users with a matching login token
      if (rows.length == 0) return reject(); //The token doesn't match any tokens in the database (Likely for a user that has had the token updated)
      resolve(rows[0].username); //Pass the username of the logged in user
    }, (code, msg) => {
      return reject();
    });
  });
}

/*
 * Verifies the login token. If there is a user with a matching token, the username is sent to the caller, else the token cookie is cleared.
 */
exports.authorize = function(req, res) {
  if (req.cookies.token == undefined) return res.status(401).send('No token');
  verifyToken(req.cookies.token).then((username) => {
    return res.status(200).send(username);
  }).catch((result) => {
    res.clearCookie('token');
    return res.status(401).send('Invalid token');
  });
};

/*
 * Creates a new user with the given username and password.
 * A random user salt is also generated for the new account.
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
    userModel.addUser([req.body.username, pw, salt], (code, msg) => {
      res.status(code).send(msg);
    });
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
    userModel.readUser(req.body.username, (result) => {
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
    userModel.addUserToken([token_obj.toString('hex'), req.body.username], (token) => {
      res.cookie('token', token, {maxAge: 1200000, httpOnly: false}); //Issuing the login token
      res.status(200).send(req.body.username);
    }, (code, msg) => {
      res.status(code).send(msg);
    });
  });
};

/*
 * Removes the token from the database, and clears the token cookie.
 */
exports.logout = function(req, res) {
  if (req.cookies.token == undefined) return res.status(400).send('No token provided');
  userModel.removeUserToken(req.cookies.token, (code, msg) => {
    res.clearCookie('token'); //Revoking the login token
    res.status(code).send(msg);
  }, (code, msg) => {
    res.status(code).send(msg);
  });
};

/*
 * Fetches a list of icao codes for airports that are on the users favourite list.
 * Requires the login token to be verified.
 */
exports.getFavourites = function(req, res) {
  let token = req.cookies.token;
  verifyToken(token).then((username) => {
    userModel.readFavourites(username, (rows) => {
      let favourites = rows.map((row) => row.airport);
      return res.status(200).send(favourites);
    }, (code, msg) => {
      return res.status(code).send(msg);
    });
  }).catch(() => res.status(401).send('Invalid token'));
};

/*
 * Adds the icao given in the request body to the users favourites list in the database.
 * If the airport is already in the users favourites, or the user already has atleast 5 favourites
 * the airport is not added and an error is sent to the caller.
 * Requires the login token to be verified.
 */
exports.addFavourite = function(req, res) {
  let token = req.cookies.token;
  let icao = req.body.icao;
  let username;
  if (icao == undefined) return res.status(400).send('No icao provided');
  verifyToken(token).catch((result) => res.status(401).send('Invalid token'))
  .then((result) => {
    username = result;
    return new Promise((resolve, reject) => {
      userModel.readFavourites(username, (rows) => {
        resolve(rows);
      }, (code, msg) => {
        return res.status(code).send(msg);
      });
    });
  }).then((result) => {
    for (let i=0; i<result.length; i++) {
      if (result[i].airport == icao) return res.status(500).send('Airport is already a favourite');
    }
    if (result.length >= 5) return res.status(500).send('User has the maximum number of favourites');
    return new Promise((resolve, reject) => {
      userModel.addFavourite(username, icao, (rows) => {
        return res.status(201).send(`${icao} added to favourites`);
      }, (code, msg) => {
        return res.status(code).send(msg);
      });
    });
  });
};

/*
 * Removes the icao given in the path from the users favourites list. No checking for prior existence of the airport
 * in the users favourites list is made.
 * Requires the login token to be verified.
 */
exports.removeFavourite = function(req, res) {
  let token = req.cookies.token;
  let icao = req.params.icao;
  verifyToken(token).then((username) => {
    userModel.removeFavourite(username, icao, (result) => {
      return res.status(200).send(`${icao} removed from favourites`);
    }, (code, msg) => {
      return res.status(code).send(msg);
    });
  }).catch(() => res.status(401).send('Invalid token'));
};
