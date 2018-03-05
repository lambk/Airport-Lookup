const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());
const request = require('request');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/api', function(req, res) {
  var icao = req.body.icao;
  var options = {
    url: 'https://api.checkwx.com/metar/' + icao,
    headers: {
      'X-API-Key': 'aaf9e7d57dac55d7bb3d539fd7'
    }
  }
  request(options, function (err, response, body) {
    console.log('Checkwx api call: ' + response.statusCode);
    console.log(response.body);
    if (response.statusCode == 200) {
      res.send({redirect : '/airport/' + icao});
    } else {
      console.log(err);
      res.send('Error fetching metar for ' + icao);
    }
  });
});

app.get('/airport/:icao', function(req, res) {
  res.send('Page for ' + req.params.icao);
});

app.listen(3000, function () {
  console.log('App running (port 3000)');
});
