"use strict";

class Tower {
    constructor(id, x, y, type) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
    };
    generateRandomSprinkles(count) {
        var toReturn = [];
        for (var i = 0; i < count; i++) {
            var currentRadius = 100 * Math.random();
            var currentDirection = 2 * Math.PI * Math.random();
            var currentX = this.x + (currentRadius * Math.cos(currentDirection));
            var currentY = this.y + (currentRadius * Math.sin(currentDirection));
            toReturn.push(currentX);
            toReturn.push(currentY);
        }
        return toReturn;
    }
};

class Game {
    constructor() {
        this.players = [];
        this.towers = [new Tower(1, 300, 300, 1)];
        this.interval = setInterval(() => {
            //console.log(this.players);
            this.gameLoop();
        }, 250);
    }
    gameLoop() {
        var sprinkles = [];
        this.towers.forEach((tower, index) => {
            sprinkles.push.apply(sprinkles, tower.generateRandomSprinkles(1));
        });

        this.players.forEach((player, index) => {
            player.playerLoop(sprinkles);
        });
    }
}

class Player {
    constructor(ws, game) {
        this.ws = ws;
        this.game = game;
    }
    playerLoop(sprinkles) {

        this.ws.send(JSON.stringify({
            sprinkles: sprinkles
        }), function() { /* ignore errors */ });
    }
}

var games = [];

//for now we're just going to have one game and all players (clients) will join it
games[0] = new Game();


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8081
    });

wss.on('connection', function connection(ws) {
    console.log('new client connection');

    //make a unique uuid
    //    ws.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //        var r = crypto.randomBytes(1)[0] % 16 | 0,
    //            v = c == 'x' ? r : (r & 0x3 | 0x8);
    //        return v.toString(16);
    //    });

    games[0].players.push(new Player(ws));

    ws.on('close', function() {
        games[0].players.splice(ws, 1);
        console.log('client left');
    });

    ws.on('message', function(data, flags) {
        data = JSON.parse(data);
        console.log('event rxd');
        if (data.event === 'new tower') {
            console.log('event: create tower');
            var tower = new Tower(data.id, data.x, data.y, data.type);
            games[0].towers.push(tower);
            //console.log(towers);
        }
    });

});