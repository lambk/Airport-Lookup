const db = require('../db');
const crypto = require('crypto');

exports.addUser = function(data, done) {
  db.get_pool().query('INSERT INTO users(username, password, salt) VALUES(?,?,?)', data, (err, result) => {
    if (err) {
      if (err.code == 'ER_DUP_ENTRY') return done(500, `Account ${data[0]} already exists`);
      return done(500, 'Error inserting into users');
    }
    return done(201, `Account ${data[0]} created`);
  });
};

exports.readUser = function(username, done, failure) {
  db.get_pool().query('SELECT * FROM users WHERE username=?', username, (err, rows) => {
    if (err) return failure(500, 'Error reading from users');
    return done(rows);
  });
};

exports.readUserByToken = function(token, done, failure) {
  db.get_pool().query('SELECT * FROM users WHERE token=?', token, (err, rows) => {
    if (err) return failure(500, 'Error reading from users');
    return done(rows);
  });
};

exports.addUserToken = function(data, done, failure) {
  db.get_pool().query('UPDATE users SET token=? WHERE username=?', data, (err, result) => {
    if (err) return failure(500, 'Error adding user token');
    return done(data[0]);
  });
};

exports.removeUserToken = function(token, done, failure) {
  db.get_pool().query('UPDATE users SET token=NULL WHERE token=?', token, (err, result) => {
    if (err) return failure(500, 'Error removing user token');
    return done(200, 'User token removed');
  })
};

exports.readFavourites = function(username, done, failure) {
  db.get_pool().query('SELECT * FROM user_airport_favourites WHERE username=?', username, (err, rows) => {
    if (err) return failure(500, 'Error reading favourites');
    return done(rows);
  });
};

exports.addFavourite = function(username, icao, done, failure) {
  db.get_pool().query('INSERT INTO user_airport_favourites(username, airport) VALUES(?, ?)', [username, icao], (err, result) => {
    if (err) return failure(500, 'Error adding favourite');
    return done(result);
  });
};

exports.removeFavourite = function(username, icao, done, failure) {
  db.get_pool().query('DELETE FROM user_airport_favourites WHERE username=? AND airport=?', [username, icao], (err, result) => {
    if (err) return failure(500, 'Error removing favourite');
    return done(result);
  });
};
