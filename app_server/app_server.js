"use strict";
//http stuff
var express = require('express');
var app = express();
//ws stuff
var Utility = require('./Utility.js');
var Room = require('./Room.js');
var WebSocketServer = require('ws').Server;

//ws stuff
var rooms = [];
rooms[0] = new Room();//for now just one room

var wss = new WebSocketServer({port: 8082});
wss.on('connection', function connection(ws) {
    rooms[0].addNewPlayer(ws);
});

//http stuff
app.use(express.static(__dirname + '/public'));
app.listen(8080);
