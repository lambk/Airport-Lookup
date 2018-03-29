const mysql = require('mysql');

const db  = {
  pool: null
};

exports.connect = function(done) {
  db.pool = mysql.createPool(process.env.JAWSDB_URL);
  done();
};

exports.get_pool = function() {
  return db.pool;
};
