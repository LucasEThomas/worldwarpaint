"use strict";
var Utility = require('./Utility.js');
var Game = require('./Classes/Game.js');
var Player = require('./Classes/Player.js');
var Unit = require('./Classes/Unit.js');

//for now we're just going to have one game and all players (clients) will join it
var games = [new Game()];

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8081
    });

wss.on('connection', function connection(ws) {
    games[0].addNewPlayer(ws);
});