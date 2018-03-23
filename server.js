require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

require('./app/routes.js')(app, __dirname);

let port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('App running (port ' + port + ')');
});
