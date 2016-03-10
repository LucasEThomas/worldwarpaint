"use strict";
var Utility = require('./Utility.js');
var Room = require('./Room.js');
var WebSocketServer = require('ws').Server;

var rooms = [];
rooms[0] = new Room();//for now just one room

var wss = new WebSocketServer({port: 8082});
wss.on('connection', function connection(ws) {
    rooms[0].addNewPlayer(ws);
});
