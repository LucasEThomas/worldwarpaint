"use strict";
var Unit = require('./Unit.js');

class SniperTower extends Unit {
    constructor(id, x, y, owner, gameState) {
        super(id, x, y, 'sniperTower', owner, gameState);

        this.sniperAngle = 0;
        this.sniperRangeMin = 50;
        this.sniperRangeMax = 250;
        this.sniperROFInterval = 1000;
        this.sniperDamage = 5;
        this.sniperRotateSpeed = Math.TWOPI / 49; //spin per 20th of a second.
        this.sniperAttackAngle = Math.TWOPI / 20; //how close the sniper has to aim before it can fire

        this.lastSnipeTimestamp = Date.now();
    }

    generateEvents(time) {
        let events = [];

        if (time - this.lastSnipeTimestamp >= this.sniperROFInterval) {
            let target = this.findNearestTarget();
            if (target) {
                let damage = Math.floor(Math.getRandomArbitrary(this.sniperDamage - 2, this.sniperDamage + 3));
                events.push({
                    unitId: this.id,
                    ownerId: this.ownerId,
                    type: 'snipe',
                    targetId: target.id,
                    damage: damage,
                });
                this.lastSnipeTimestamp = time;
            }
        }
        events.push(...super.generateEvents(time));

        return events;
    }
    findNearestTarget() {
        let lowestDist = 1000000000;
        let target = null
        this.gameState.gameUnits.forEach((nTarget, n) => {
            let sqrDist = this.sqrDistTo(nTarget)
            if (nTarget.clrName !== this.clrName && sqrDist < lowestDist && nTarget.id != this.id) {
                target = nTarget;
                lowestDist = sqrDist;
            }
        });
        return this.testCanSnipe(target) ? target : null
    }
    testCanSnipe(unit) {
        if (unit) {
            let maxRangeSqr = Math.pow(this.sniperRangeMax, 2);
            let minRangeSqr = Math.pow(this.sniperRangeMin, 2);
            let distSqr = this.sqrDistTo(unit);

            return distSqr <= maxRangeSqr && distSqr >= minRangeSqr && unit.clrName != this.clrName;
        }
        else{
            return false;
        }
    }
    sqrDistTo(unit) {
        let distX = this.x - unit.x;
        let distY = this.y - unit.y;
        let distSqr = Math.pow(distX, 2) + Math.pow(distY, 2);
        return distSqr;
    }
}

module.exports = SniperTower;