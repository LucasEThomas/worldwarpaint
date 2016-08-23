"use strict";
//http stuff
var request = require('request');
var express = require('express');
var app = express();
//ws stuff
var Utility = require('./Utility.js');
var Room = require('./Room.js');
var WebSocketServer = require('ws').Server;

var datastores = require('./Datastore.js');

var roomServersDatastore = new datastores.RoomServersDatastore();


//http stuff
app.use(express.static(__dirname + '/public'));

app.get('/externalip', function(req, res) {
	getExternalIp((body) => {
		//console.log(body);
		res.send(body);

	});
});

app.get('/listallservers', function(req, res) {
});

app.listen(8080);

//ws stuff
var rooms = [];
rooms[0] = new Room(); //for now just one room

var wss = new WebSocketServer({
});
wss.on('connection', function connection(ws) {
});

// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.
var METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/' +

function getExternalIp(cb) {


}