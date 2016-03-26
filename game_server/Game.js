"use strict";
var Utility = require('./Utility.js');
var Player = require('./Player.js');
var Map = require('./Map.js');
var Unit = require('./Unit.js');
var uuid = require('node-uuid');

class Game {
    constructor() {
        this.map = new Map(64, 64);
        this.players = [
            new Player('dda2571a-55d9-46d3-96c2-8b984164c904', null, Utility.hexToRgb(this.pickRandomColor())),
            new Player('5afdaeaf-f317-4470-ae6f-33bca53fd0de', null, Utility.hexToRgb(this.pickRandomColor())),
            new Player('dda2571a-55d9-46d3-96c2-8b984164c905', null, Utility.hexToRgb(this.pickRandomColor()))];
        // create a units array, for now we auto-generate two units linked to two players for testing
        this.units = [
            new Unit(1, 600, 300, 'hero', 'dda2571a-55d9-46d3-96c2-8b984164c904'),
            new Unit(2, 900, 300, 1, '5afdaeaf-f317-4470-ae6f-33bca53fd0de'),
            new Unit(3, 750, 560, 1, 'dda2571a-55d9-46d3-96c2-8b984164c905')];
        this.extraEvents = [];

        this.interval = setInterval(() => {
            this.gameLoop();
        }, 250);
        this.reverseIterate = false;
        this.roundRobinOffset = 0;
    }
    addNewPlayer(ws) {
        // make a unique uuid
        var id = uuid.v4();
        var clr = Utility.hexToRgb(this.pickRandomColor());

        var onInitSyncLoc = (player) => {
            this.onInitSync(player);
        };
        var onDisconnectLoc = (player) => {
            this.onDisconnect(player);
        };
        var onNewTowerLoc = (player, x, y, type, ownerId) => {
            this.onNewTower(player, x, y, type, ownerId);
        };
        var onManualSplatterLoc = (player, x, y, radius, ownerId) => {
            this.onManualSplatter(player, x, y, radius, ownerId);
        };
        var onUnitDestinationLoc = (player, id, x, y) => {
            this.onUnitDestination(player, id, x, y);
        };

        var newPlayer = new Player(id, ws, clr, onInitSyncLoc, onDisconnectLoc, onNewTowerLoc, onManualSplatterLoc, onUnitDestinationLoc);
        this.players.push(newPlayer);
    }

    onInitSync(player) {
        // send players to connecting client
        var sendPlayers = this.players.map((current) => current.toJSON());
        player.initSyncServer(sendPlayers, this.units, this.map);
    }
    onDisconnect(player) {
        //remove player from players array
        this.players = this.players.filter((v) => v.id !== player.id);
    }
    onNewTower(player, x, y, type, ownerId) {
        var unit = new Unit(uuid.v4(), x, y, type, ownerId);
        this.units.push(unit);
        // push the new unit to other players
        this.players.forEach(function(currentPlayer, index) {
            currentPlayer.addUnit(unit);
        });
    }
    onManualSplatter(player, x, y, radius, ownerId) {
        this.scheduleSplatter(x, y, radius, ownerId);
    }
    onUnitDestination(player, id, x, y) {
        this.setUnitDestination(x, y, id);
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
    scheduleSplatter(x, y, radius, owner) {
        var inputIndex = 0;
        if (radius < 16)
            inputIndex = Math.round(Math.getRandomArbitrary(96, 159));
        else if (radius < 32)
            inputIndex = Math.round(Math.getRandomArbitrary(46, 95));
        else
            inputIndex = Math.round(Math.getRandomArbitrary(0, 47));

        this.extraEvents.push({
            ownerID: owner,
            type: 'manualSplatter',
            data: [{
                x: x,
                y: y,
                radius: radius,
                inputIndex: inputIndex
            }]
        });
    }
    setUnitDestination(x, y, id) {
        this.units.forEach((unit, index) => {
            if (unit.id === id) {
                unit.setDestination(x, y);
            }
        });
    }
    generateScheduleItemEvents() {
        var toReturn = [];

        this.fairlyIterateThroughUnits((unit) => {
            var events = unit.generateEvents();
            events.forEach((event, index) => {
                toReturn.push({
                    ownerID: unit.ownerID,
                    type: event.type,
                    data: event.data
                });
            });

        });

        if (this.extraEvents.length) {
            toReturn.push(...this.extraEvents);
            this.extraEvents.length = 0;
        }

        return toReturn;
    }
    fairlyIterateThroughUnits(callback) {
        var tLength = this.units.length; //cache for clean code and minor speed increase
        for (var i = 0; i < tLength; i++) {
            var rri = (i + this.roundRobinOffset) % tLength;
            var unit = this.units[this.reverseIterate ? -rri + tLength - 1 : rri]
            callback(unit);
        }
        if (this.reverseIterate) {
            this.roundRobinOffset = (this.roundRobinOffset + 1) % tLength;
        }
        this.reverseIterate = !this.reverseIterate;
    }
    convertColorNameToColor(name) {
        var colorsDict = {
            blue: '#4186EF',
            teal: '#57C5B8',
            white: '#3C3042',
            yellow: '#ECC82F',
            orange: '#F28B31',
            red: '#EB4D4D',
            magenta: '#EC53AC',
            violet: '#9950B4'
        };
        return colorsDict[name];
    }
    pickRandomColor() {
        var colors = ['blue', 'teal', 'white', 'yellow', 'orange', 'red', 'magenta', 'violet'];
        var chosenColor = colors[Math.rangeInt(0, colors.length - 1)];
        return this.convertColorNameToColor(chosenColor);
    }
}

module.exports = Game;