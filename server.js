const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());
const request = require('request');

let port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/metar/:icao', function(req, res) {
  var icao = req.params.icao;
  var options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  request(options, function(err, response, body) {
    console.log('Fetching Metar for ' + icao + ' from CheckWx');
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      var metar_data = JSON.parse(response.body);
      res.send(metar_data);
    } else {
      console.log(err);
      res.send({'ERROR' : err});
    }
  });
});

app.get('/api/airport/:icao', function(req, res) {
  var icao = req.params.icao;
  var options = {
    url: 'https://api.checkwx.com/station/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  request(options, function(err, response, body) {
    console.log('Fetching Airport Data for ' + icao + ' from CheckWx');
    console.log('Response code: ' + response.statusCode);
    if (response.statusCode == 200) {
      var airport_data = JSON.parse(response.body);
      res.send(airport_data);
    } else {
      console.log(err);
      res.send({'ERROR' : err});
    }
  });
});

app.get('/airport/:icao', function(req, res) {
  res.sendFile(__dirname + '/views/airport.html');
});

app.listen(port, function() {
  console.log('App running (port ' + port + ')');
});
