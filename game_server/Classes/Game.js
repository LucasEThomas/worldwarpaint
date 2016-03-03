"use strict";
var Utility = require('../Utility.js');
var Victor = require('victor');
var Player = require('./Player.js');
var Unit = require('./Unit.js');

class Game {
    constructor() {
        this.players = [
            new Player('dda2571a-55d9-46d3-96c2-8b984164c904', null), 
            new Player('5afdaeaf-f317-4470-ae6f-33bca53fd0de', null), 
            new Player('dda2571a-55d9-46d3-96c2-8b984164c905', null)];
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
    scheduleSplatter(x,y,radius,owner){
        var inputIndex = 0;
        if(radius < 16) 
            inputIndex = Math.round(Math.getRandomArbitrary(96,159));
        else if(radius < 32) 
            inputIndex = Math.round(Math.getRandomArbitrary(46,95));
        else 
            inputIndex = Math.round(Math.getRandomArbitrary(0,47));
        
        this.extraEvents.push({
            ownerID: owner,
            type: 'manualSplatter',
            data: [{
                x:x,
                y:y,
                radius:radius,
                inputIndex: inputIndex
            }]
        });
    }
    setUnitDestination(x,y,id){
        this.units.forEach((unit,index)=>{
            if(unit.id === id){
                unit.setDestination(x,y);
                console.log('id:'+id+' unit found!')
            }
        });
    }
    generateScheduleItemEvents() {
        var toReturn = [];
        
        this.fairlyIterateThroughUnits((unit)=>{
            var events = unit.generateEvents();
            events.forEach((event, index)=>{
                toReturn.push({
                    ownerID: unit.ownerID,
                    type: event.type,
                    data: event.data
                });
            });

        });
        
        if(this.extraEvents.length){
            toReturn.push(...this.extraEvents);
            this.extraEvents.length = 0;
        }
        
        return toReturn;
    }
    fairlyIterateThroughUnits(callback){
        var tLength = this.units.length; //cache for clean code and minor speed increase
        for(var i = 0; i< tLength; i++){
            var rri = (i+this.roundRobinOffset)%tLength;
            var unit = this.units[this.reverseIterate?-rri+tLength-1:rri]
            callback(unit);
        }
        if(this.reverseIterate){
            this.roundRobinOffset = (this.roundRobinOffset + 1) % tLength;
        }
        this.reverseIterate = !this.reverseIterate;
    }
}

module.exports = Game;