"use strict";
var Utility = require('./Utility.js');
var Victor = require('victor');
var Game = require('./Classes/Game.js');
var Player = require('./Classes/Player.js');
var Unit = require('./Classes/Unit.js');

var games = [];

//for now we're just going to have one game and all players (clients) will join it
games[0] = new Game();

var getPlayerIndex = function(playerID) {
    // pindex is used to detect if player is already in the game (based on id)
    var pindex = -1;
    // iterate players array
    for (var key in games[0].players) {
        // if id from client matches player in players array
        if (games[0].players[key].id === playerID) {
            // set pindex to key of matching player
            pindex = key;
            break;
        }
    }
    return pindex;
}


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8081
    });

var player = null;

wss.on('connection', function connection(ws) {
    console.log('new client connection');

    //make a unique uuid
    //    ws.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //        var r = crypto.randomBytes(1)[0] % 16 | 0,
    //            v = c == 'x' ? r : (r & 0x3 | 0x8);
    //        return v.toString(16);
    //    });

    //var player = new Player(ws);
    //games[0].players.push(new Player('3222', ws));

    ws.on('close', function() {
        //games[0].players.splice(ws, 1);
        console.log('client left');
    });

    ws.on('message', function(data, flags) {
        data = JSON.parse(data);
        console.log('event rxd');
        if (data.event === 'new tower') {
            console.log('event: create unit');
            // client created unit, syncing data to server
            var unit = new Unit(data.id, data.x, data.y, data.type, data.owner);
            games[0].units.push(unit);
            // push the new unit to other players
            var dontSend = getPlayerIndex(data.owner);
            console.log(dontSend);
            games[0].players.forEach(function(e, i) {
                if (dontSend != i && e.ws) {
                    e.ws.send(JSON.stringify({
                        event: 'sync-addUnit',
                        unit: unit
                    }));
                }
            });
        } else  if (data.event === 'manual splatter') {
            console.log('event: manual splatter');
            games[0].scheduleSplatter(data.x,data.y,data.radius,data.owner);
        } else  if (data.event === 'unit destination') {
            console.log('event: unit destination');
            games[0].setUnitDestination(data.x,data.y,data.id);
        } else if (data.event === 'initsyncClient') {
            console.log('initsyncClient');
            // initial sync from client

            var pindex = getPlayerIndex(data.playerID);
            // check if player exists
            if (pindex >= 0) {
                player = games[0].players[pindex];
                player.ws = ws;
            } else {
                // player doesn't exist in this game, create the player
                player = new Player(data.playerID, ws);
                games[0].players.push(player);
            }
            var sendPlayers = [];
            for (var k in games[0].players) {
                sendPlayers.push(games[0].players[k].toJSON());
            }
            // send players to connecting client
            ws.send(JSON.stringify({
                event: 'initsyncServer',
                playerClr: player.clr,
                playerID: data.playerID,
                players: sendPlayers,
                units: games[0].units
            }), function() { /* ignore errors */ });
        }
    });
});