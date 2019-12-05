var express = require('express');
var app = express();
var path = require('path');
var data = {};
//serve first page
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


require('dotenv').config({path: __dirname + '/.env'})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
//serve all root directory*
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/env', function(req, res) {
	var envdata = { "port" : process.env.PORT, "host" : process.env.HOST, "address" : process.env.ADDRESS, "callback": process.env.CALLBACK, "api": process.env.API };
    res.send(JSON.stringify(envdata));
});
app.get('/transactions', function(req, res) {
    res.send(JSON.stringify(data));
});
app.get('/transactions/:name', function(req, res) {
    res.send(JSON.stringify(data[req.params.name]));
});
app.delete('/transactions/:name', function(req, res) {
	var name = req.params.name;
	delete data[name];
    res.sendStatus(200);
});

app.get('/save', function(req, res) {
	var valuename = req.query.name;
	var received = 0;
	data[valuename] = received;
	res.sendStatus(200);
});

app.post('/callback', function(req, res) {
    var valuename = req.body.name;
	var status = req.body.status;
	if(status == 200){
			data[valuename] = 1;
	}
	res.sendStatus(200);
});

app.listen(process.env.PORT, () => console.log(`TRTL SHOP Server listening on port ${process.env.PORT}!`));