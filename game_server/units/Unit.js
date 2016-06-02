"use strict";
var Victor = require('victor');

var unitTypes = ['champion', 'archer', 'sprinklerTower'];

class Unit {
    constructor(id, x, y, type, owner) {
        this.id = id;
        this.x = x; //units current position
        this.y = y;
        this.destX = x; //if the unit is moving, it's current destination
        this.destY = y;
        this.type = type;
        this.ownerId = owner;
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
}

module.exports = Unit;