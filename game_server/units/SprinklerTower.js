"use strict";
var Unit = require('./Unit.js');

class SprinklerTower extends Unit {
    constructor(id, x, y, owner, gameState) {
        super(id, x, y, 'sprinklerTower', owner, gameState);

        this.sprinklerAngle = 0;
        this.sprinklerRangeMin = 100;
        this.sprinklerRangeMax = 400;
        this.sprinklerROFInterval = 500;
        this.sprinklerSplashRadius = 30;
        this.sprinklerSpinRate = Math.TWOPI / 11; //spin per tick.
        this.sprinklerHeads = 1;

        this.lastSprinkleTimestamp = Date.now();
    }

    generateEvents(time) {
        let events = [];
        this.updateProperties(time);
        if (time - this.lastSprinkleTimestamp >= this.sprinklerROFInterval) {
            let distance = Math.getRandomArbitrary(this.sprinklerRangeMin, this.sprinklerRangeMax);
            let direction = this.sprinklerAngle;
            let radius = Math.round(Math.getRandomArbitrary(this.sprinklerSplashRadius - 2, this.sprinklerSplashRadius + 2));
            for(let theta = 0; theta < Math.TWOPI; theta += Math.TWOPI / 5){
                let event = this.createSplatter(distance, direction + theta, radius)
                if(event)
                    events.push(event);
            }
            

            this.lastSprinkleTimestamp = time;
        }
        events.push(...super.generateEvents(time));

        return events;
    }

    createSplatter(distance, direction, radius) {
        let splatterX = Math.round(this.x + (distance * Math.cos(direction)));
        let splatterY = Math.round(this.y + (distance * Math.sin(direction)));
        let splatterImageIndex = Math.round(Math.getRandomArbitrary(0, 47));
        if (splatterX - radius > 0 && splatterX + radius < 2047 && splatterY - radius > 0 && splatterY + radius < 2047)
            return {
                unitId: this.id,
                ownerId: this.ownerId,
                type: 'sprinkle',
                x: splatterX,
                y: splatterY,
                radius: radius,
                inputIndex: splatterImageIndex
            };
    }

    updateProperties(time) {
        this.sprinklerAngle = (this.sprinklerAngle + this.sprinklerSpinRate) % Math.TWOPI;
    }
}

module.exports = SprinklerTower;