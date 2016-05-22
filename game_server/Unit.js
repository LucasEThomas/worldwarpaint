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
    };
    setDestination(x, y) {
        this.destX = x;
        this.destY = y;
    }
    generateEvents() {
        //this method will generate all sorts of events for each type of unit
        var toReturn = [];
        //just create 5 sprinkles for now.
        var sprinkles = [];
        for (var i = 0; i < 1; i++) {
            var unitRange = 200 * Math.random();
            var randomDirection = Math.TWOPI * Math.random();
            var splatterX = Math.round(this.x + (unitRange * Math.cos(randomDirection)));
            var splatterY = Math.round(this.y + (unitRange * Math.sin(randomDirection)));
            var splatterRadius = Math.round(Math.getRandomArbitrary(15, 32));
            if (splatterX - splatterRadius > 0 && splatterX + splatterRadius < 2047 && splatterY - splatterRadius > 0 && splatterY + splatterRadius < 2047)
                sprinkles.push({
                    x: splatterX,
                    y: splatterY,
                    radius: splatterRadius,
                    inputIndex: Math.round(Math.getRandomArbitrary(96, 159))
                });
        }
        toReturn.push({
            type: 'sprinklerUnit',
            data: sprinkles
        });

        if (this.destX !== this.x || this.destY !== this.y) {
            toReturn.push(generateMoveEvent());
        }
        return toReturn;
    }
    
    generateSprinkleEvents(){
        
    }

    generateMoveEvent() {
        var currentPoint = new Victor(this.x, this.y);
        var destPoint = new Victor(this.destX, this.destY);
        var direction = destPoint.clone().subtract(currentPoint).direction();
        var distance = currentPoint.distance(destPoint);
        if (distance <= 5) {
            this.x = this.destX;
            this.y = this.destY;
        } else {
            var deltaVector = new Victor(5, 0).rotate(direction);
            this.x += deltaVector.x;
            this.y += deltaVector.y;
        }

        return {
            type: 'moveUnit',
            data: {
                x: this.x,
                y: this.y,
                id: this.id
            }
        };
    }
}

module.exports = Unit;