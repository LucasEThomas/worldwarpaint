"use strict";
var Utility = require('./Utility.js');
var Player = require('./Player.js');
var Map = require('./Map.js');
var CensusData = require('./CensusData.js');
var SprinklerTower = require('./units/SprinklerTower.js');
var SniperTower = require('./units/SniperTower.js');
var HealerTower = require('./units/HealerTower.js');
var uuid = require('node-uuid');

class Game {
    constructor() {
        this.map = new Map(64, 64);
        this.censusData = new CensusData();
        this.players = [];
        this.units = [];
        this.unitlessEvents = [];

        this.interval = setInterval(() => this.gameLoop(), 250);
    }
    addNewPlayer(ws) {
        // make a unique uuid
        var id = uuid.v4();
        var clrName = this.pickRandomColorName()
        var clr = Utility.hexToRgb(this.convertColorNameToColor(clrName));

        var newPlayer = new Player(id, ws, clrName, clr, ...[
            (...a) => this.onCensusVote(...a),
            (...a) => this.onInitSync(...a),
            (...a) => this.onDisconnect(...a),
            (...a) => this.onNewTower(...a),
            (...a) => this.onDestroyTower(...a),
            (...a) => this.onManualSplatter(...a),
            (...a) => this.onUnitDestination(...a)]);
        this.players.push(newPlayer);
    }

    onCensusVote(player, data) {
        this.censusData.arbiter.processVotes(player, data.votes);
    }

    onInitSync(player, data) {
        // send players to connecting client
        //this.onNewTower(player, 1000, 1000, 'champion', player.id);
        var sendPlayers = this.players.map((current) => current.toJSON());
        player.initSyncServer(sendPlayers, this.units, this.map);
    }
    onDisconnect(player) {
        //remove player from players array
        //this.players = this.players.filter((v) => v.id !== player.id);
    }
    onNewTower(player, x, y, type, ownerId) {
        let unit = null;
        if (type === 'sprinklerTower') {
            unit = new SprinklerTower(uuid.v4(), x, y, player);
        } else if (type === 'sniperTower') {
            unit = new SniperTower(uuid.v4(), x, y, player, this.units);
        } else if (type === 'healerTower') {
            unit = new HealerTower(uuid.v4(), x, y, player, this.units);
        }

        if (unit) {
            this.units.push(unit);
            this.players.forEach((nPlayer, index) => nPlayer.syncNewUnit(unit));
        }
    }
    onDestroyTower(id) {
        let index = this.units.map((u) => u.id).indexOf(id);
        if (index >= 0) {
            this.units.splice(index, 1);
        }
    }
    onManualSplatter(player, x, y, radius, ownerId) {
        var inputIndex = 0;
        if (radius < 16)
            inputIndex = Math.round(Math.getRandomArbitrary(96, 159));
        else if (radius < 32)
            inputIndex = Math.round(Math.getRandomArbitrary(46, 95));
        else
            inputIndex = Math.round(Math.getRandomArbitrary(0, 47));

        this.unitlessEvents.push({
            ownerId: ownerId,
            type: 'manualSplatter',
            x: x,
            y: y,
            radius: radius,
            inputIndex: inputIndex
        });
    }
    onUnitDestination(player, id, x, y) {
        this.units.find((unit) => unit.id === id).setDestination(x, y);
    }

    gameLoop() {
        this.censusData.holdElections().forEach((nDistrict, n) => {
            this.unitlessEvents.push({
                type: 'districtUpdate',
                n: nDistrict.n,
                clr: nDistrict.clr,
                lvl: nDistrict.lvl
            });
        });
        var schedule = [];
        //Schedule 5 event ops per update. We are currently running 4 updates per sec, so there will be 20 paint ops per sec client side.
        let currentTime = Date.now();
        for (var i = 0; i < 5; i++) {
            let scheduleTime = currentTime + i * 50;
            schedule.push(this.generateScheduleItemEvents(scheduleTime));
        }

        if (this.unitlessEvents.length) {
            schedule[0].push(...this.unitlessEvents);
            this.unitlessEvents = [];
        }

        this.players.forEach((player, index) => player.syncNewEvents(schedule));
    }
    generateScheduleItemEvents(time) {
        let events = [];
        this.units.forEach((unit, index) => events.push(...unit.generateEvents(time)));
        return events;
    }
    convertColorNameToColor(name) {
        var colorsDict = {
            blue: '#4186EF',
            teal: '#57C5B8',
            white: '#F0E0E2',
            yellow: '#ECC82F',
            orange: '#F28B31',
            red: '#EB4D4D',
            magenta: '#EC53AC',
            violet: '#B970D4'
        };
        return colorsDict[name];
    }
    pickRandomColor() {
        var colors = ['blue', 'teal', 'white', 'yellow', 'orange', 'red', 'magenta', 'violet'];
        var chosenColor = colors[Math.rangeInt(0, colors.length - 1)];
        return this.convertColorNameToColor(chosenColor);
    }
    pickRandomColorName() {
        var colors = ['blue', 'teal', 'white', 'yellow', 'orange', 'red', 'magenta', 'violet'];
        return colors[Math.rangeInt(0, colors.length - 1)];
    }
}

module.exports = Game;