const db = require('../db');

exports.TYPE = {
  AIRPORT: 'Airport',
  METAR: 'Metar',
  API: 'API',
  ERROR: 'Error'
};

exports.log = function(type, message) {
  console.log(type + ': ' + message); //Print the log to console
  //Add the log to the database
  db.get_pool().query('INSERT INTO logs(type, message) VALUES(?,?)', [type, message], (err, result) => {
    if (err) console.log('Error adding log to database');
  });
};
