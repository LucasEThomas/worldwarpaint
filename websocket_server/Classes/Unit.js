"use strict";
var Utility = require('../Utility.js');
var Victor = require('victor');

class Unit {
    constructor(id, x, y, type, owner) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.ownerID = owner;
        if(type === 'hero'){
            this.destX = x;
            this.destY = y;
        }
    };
    setDestination(x,y){
        if(this.type === 'hero'){
            this.destX = x;
            this.destY = y;
        }
    }
    generateEvents() {
        //this method will generate all sorts of events for each type of unit
        var toReturn = [];
        //just create 5 sprinkles for now.
        var sprinkles = [];
        for (var i = 0; i < 5; i++) {
            var unitRange = 200 * Math.random();
            var randomDirection = Math.TWOPI * Math.random();
            var splatterX = Math.round(this.x + (unitRange * Math.cos(randomDirection)));
            var splatterY = Math.round(this.y + (unitRange * Math.sin(randomDirection)));
            var splatterRadius = Math.round(Math.getRandomArbitrary(15,32));
            //var controlPoints = this.generateBlobControlPoints(currentX, currentY, currentRadius, 32);
            if(splatterX - splatterRadius > 0 && splatterX + splatterRadius < 2047 && splatterY - splatterRadius > 0 && splatterY + splatterRadius < 2047)
            sprinkles.push({
                x:splatterX,
                y:splatterY,
                radius:splatterRadius,
                inputIndex: Math.round(Math.getRandomArbitrary(96,159))
            });
        }
        toReturn.push({
            type: 'sprinklerUnit',
            data: sprinkles
        });
        

        
        if(this.type === 'hero' && (this.destX !== this.x || this.destY !== this.y)){
            var currentPoint = new Victor(this.x, this.y);
            var destPoint = new Victor(this.destX, this.destY);
            var direction = destPoint.clone().subtract(currentPoint).direction();
            var distance = currentPoint.distance(destPoint);
            if(distance <= 5){
                this.x = this.destX;
                this.y = this.destY;
            }
            else{
                var deltaVector = new Victor(5,0).rotate(direction);
                this.x += deltaVector.x;
                this.y += deltaVector.y;
            }
            
            toReturn.push({
                type: 'moveUnit',
                data: {
                    x:this.x,
                    y:this.y,
                    id:this.id
                }
            });
        }
        
        return toReturn;
    }
    generateBlobControlPoints(x, y, radius, count) {
    var toReturn = [];
    for (var i = 0; i < count; i++) {
        var angle = Math.TWOPI * i / count;
        var randomRadius = radius + radius * Math.getRandomArbitrary(-0.1, 0.1);
        toReturn.push({
            x:Math.round(x + (randomRadius * Math.cos(angle))), 
            y:Math.round(y + (randomRadius * Math.sin(angle)))
        })
    }
    return toReturn;
}
};

module.exports = Unit;