"use strict";
var Unit = require('./Unit.js');

class HealerTower extends Unit {
    constructor(id, x, y, owner, gameState) {
        super(id, x, y, 'healerTower',  owner, gameState);

        this.healerAngle = 0;

        this.healerRangeMax = 250;
        this.healerROFInterval = 2000;
        this.healerPower = 5;
        this.healerRotateSpeed = Math.TWOPI / 49; //spin per 20th of a second.
        this.healerAttackAngle = Math.TWOPI / 20; //how close the healer has to aim before it can fire

        this.lastHealTimestamp = Date.now();
    }

    generateEvents(time) {
        let events = [];

        if (time - this.lastHealTimestamp >= this.healerROFInterval) {
            let target = this.findNeediestTarget();
            if (target) {
                let amount = Math.floor(Math.getRandomArbitrary(this.healerPower - 2, this.healerPower + 3));
				target.takeHealing(amount);
                events.push({
                    unitId: this.id,
                    ownerId: this.ownerId,
                    type: 'heal',
                    targetId: target.id,
                    amount: amount,
                });
                this.lastHealTimestamp = time;
            }
        }
        events.push(...super.generateEvents(time));

        return events;
    }
    findNeediestTarget() {
        let lowestHealth = 1000000000;
        let maxRangeSqr = Math.pow(this.healerRangeMax, 2);
        let targets = this.gameState.gameUnits.filter((nUnit)=>this.testCanHeal(nUnit));
        //let target = null;
//        targets.forEach((nTarget, n) => {
//            if (target.health < lowestHealth) {
//                target = nTarget;
//                lowestHealth = sqrDist;
//            }
//        });
        return targets[0];
    }
    testCanHeal(unit) {
        if (unit) {
            let maxRangeSqr = Math.pow(this.healerRangeMax, 2);
            let distSqr = this.sqrDistTo(unit);

            return distSqr <= maxRangeSqr && unit.clrName === this.clrName && unit.id != this.id && unit.needsHealing();
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

module.exports = HealerTower;