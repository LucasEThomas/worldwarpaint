"use strict";
var Victor = require('victor');

var unitTypes = ['champion', 'archer', 'sprinklerTower'];

class Unit {
    constructor(id, x, y, type, owner) {
        this.id = id;
        this.ownerId = owner.id;
        this.clr = owner.clr;
        this.clrName = owner.clrName;
        this.x = x; //units current position
        this.y = y;
        this.destX = x; //if the unit is moving, it's current destination
        this.destY = y;
        this.type = type;
        this.speed = 5;
    };
    setDestination(x, y) {
        this.destX = x;
        this.destY = y;
    }
    generateEvents(time) {
        //this method returns an array of events
        let events = []
        if (this.destX !== this.x || this.destY !== this.y) {
            events.push(generateMoveEvent());
        }
        return events;
    }

    generateMoveEvent() {
        var currentPoint = new Victor(this.x, this.y);
        var destPoint = new Victor(this.destX, this.destY);
        var direction = destPoint.clone().subtract(currentPoint).direction();
        var distance = currentPoint.distance(destPoint);
        if (distance <= this.speed) {
            this.x = this.destX;
            this.y = this.destY;
        } else {
            var deltaVector = new Victor(this.speed, 0).rotate(direction);
            this.x += deltaVector.x;
            this.y += deltaVector.y;
        }

        return {
            type: 'moveUnit',
            x: this.x,
            y: this.y,
            id: this.id
        };
    }
    toJSON(){
        return{
            id: this.id,
            ownerId: this.ownerId,
            type: this.type,
            x: this.x,
            y: this.y,
        };
    }
}

module.exports = Unit;