"use strict";
var Unit = require('./Unit.js');

class SprinklerTower extends Unit {
    constructor(id, x, y, owner) {
        super(id, x, y, 'sprinklerTower', owner);

        this.sprinklerAngle = 0;
        this.sprinklerRangeMin = 100;
        this.sprinklerRangeMax = 150;
        this.sprinklerROFInterval = 10;
        this.sprinklerSplashRadius = 10;
        this.sprinklerSpinRate = Math.TWOPI / 49; //spin per 20th of a second.
        this.sprinklerHeads = 1;

        this.lastSprinkleTimestamp = Date.now();
    }

    generateEvents(time) {
        let events = [];
        this.updateProperties(time);
        if (time - this.lastSprinkleTimestamp >= this.sprinklerROFInterval) {
            let splatterDistance = Math.getRandomArbitrary(this.sprinklerRangeMin, this.sprinklerRangeMax);
            let splatterDirection = this.sprinklerAngle;
            let splatterX = Math.round(this.x + (splatterDistance * Math.cos(splatterDirection)));
            let splatterY = Math.round(this.y + (splatterDistance * Math.sin(splatterDirection)));
            let splatterRadius = Math.round(Math.getRandomArbitrary(this.sprinklerSplashRadius - 2, this.sprinklerSplashRadius + 2));
            let splatterImageIndex = Math.round(Math.getRandomArbitrary(96, 159));
            if (splatterX - splatterRadius > 0 && splatterX + splatterRadius < 2047 && splatterY - splatterRadius > 0 && splatterY + splatterRadius < 2047)
                events.push({
                    unitId: this.id,
                    ownerId: this.ownerId,
                    type: 'sprinkle',
                    x: splatterX,
                    y: splatterY,
                    radius: splatterRadius,
                    inputIndex: splatterImageIndex
                });
            this.lastSprinkleTimestamp = time;
        }
        events.push(...super.generateEvents(time));

        return events;
    }

    updateProperties(time) {
        this.sprinklerAngle = (this.sprinklerAngle + this.sprinklerSpinRate) % Math.TWOPI;
    }
}

module.exports = SprinklerTower;