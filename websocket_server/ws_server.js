"use strict";
var Utility = require('./Utility.js');

class Tower {
    constructor(id, x, y, type, owner) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.ownerID = owner;
    };
    generateEvent() {
        //this method will generate all sorts of events for each type of tower

        //just create 5 sprinkles for now.
        var sprinkles = [];
        for (var i = 0; i < 5; i++) {
            var currentRadius = 250 * Math.random();
            var currentDirection = 2 * Math.PI * Math.random();
            var currentX = Math.round(this.x + (currentRadius * Math.cos(currentDirection)));
            var currentY = Math.round(this.y + (currentRadius * Math.sin(currentDirection)));
            sprinkles.push({
                x: currentX,
                y: currentY,
                radius: Math.round(Math.getRandomArbitrary(5,14))
            });
        }
        return {
            type: 'sprinklerTower',
            data: sprinkles
        };
    }
};

class Game {
    constructor() {
        this.players = [new Player('dda2571a-55d9-46d3-96c2-8b984164c904', null), new Player('5afdaeaf-f317-4470-ae6f-33bca53fd0de', null)];
        // create a towers array, for now we auto-generate two towers linked to two players for testing
        this.towers = [new Tower(1, 600, 300, 1, 'dda2571a-55d9-46d3-96c2-8b984164c904'), new Tower(1, 900, 300, 1, '5afdaeaf-f317-4470-ae6f-33bca53fd0de')];
        this.interval = setInterval(() => {
            this.gameLoop();
        }, 250);
    }
    gameLoop() {
        var schedule = [];
        //Schedule 5 event ops per update. We are currently running 4 updates per sec, so there will be 20 paint ops per sec client side.
        for (var i = 0; i < 5; i++) {
            schedule.push(this.generateScheduleItemEvents());
        }

        this.players.forEach((player, index) => {
            player.scheduleEvents(schedule);
        });
    }
    generateScheduleItemEvents() {
        var toReturn = [];
        this.towers.forEach((tower, index) => {
            var event = tower.generateEvent();
            toReturn.push({
                ownerID: tower.ownerID,
                type: event.type,
                data: event.data
            });
        });
        return toReturn;
    }
}

class Player {
    constructor(id, ws) {
        this.ws = ws;
        this.id = id;
        this.clr = {
            r: Utility.rangeInt(0, 255),
            g: Utility.rangeInt(0, 255),
            b: Utility.rangeInt(0, 255),
        };
    }
    scheduleEvents(schedule) {
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    event: 'scheduleEvents',
                    schedule: schedule
                }), function() { /* ignore errors */ });
            }
        }
        // creates a dictionary for sending player info to the client
    toJSON() {
        return {
            id: this.id,
            clr: this.clr
        };
    }
}

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
            console.log('event: create tower');
            // client created tower, syncing data to server
            var tower = new Tower(data.id, data.x, data.y, data.type, data.owner);
            games[0].towers.push(tower);
            // push the new tower to other players
            var dontSend = getPlayerIndex(data.owner);
            console.log(dontSend);
            games[0].players.forEach(function(e, i) {
                if (dontSend != i) {
                    e.ws.send(JSON.stringify({
                        event: 'sync-addTower',
                        tower: tower
                    }));
                }
            });
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
                towers: games[0].towers
            }), function() { /* ignore errors */ });
        }
    });
});