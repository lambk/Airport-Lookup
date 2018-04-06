require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const enforce = require('express-sslify');

const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.user(enforce.HTTPS({trustProtoHeader : true}));

require('./app/routes.js')(app, __dirname);

db.connect(function(err) {
  if (err) console.log(err);
  db.get_pool().query('CREATE TABLE airport_cache (icao)')
});

let port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('App running (port ' + port + ')');
});
