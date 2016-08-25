"use strict";
var Victor = require('victor');

var unitTypes = ['champion', 'archer', 'sprinklerTower'];

class Unit {
	constructor(id, x, y, type, owner, gameState, options = {}) {
		this.id = id;
		this.ownerId = owner.id;
		this.gameState = gameState;
		this.clr = owner.clr;
		this.clrName = owner.clrName;
		this.x = x; //unit's current position
		this.y = y;
		this.destX = x; //if the unit is moving, its current destination
		this.destY = y;
		this.type = type;
		this.speed = options.maxHealth || 5;
		this.maxHealth = options.maxHealth || 100;
		this.health = options.maxHealth || 100;
		this.lastEnvDmgTimestamp = Date.now(); //the last time this unit took environmental damage. (so that we can do it once per second)
		this.envDmg = 0; //how much damage taken per second
		this.envDmgSus = options.envDmgSus || 0.05; //environmental Damage susceptibility, the more it is the more damage you take from paint.
		this.noClrSurvivor = options.noClrSurvivor || true; //if true, then this unit be on unpainted areas without taking damage, if false, then this unit will take damage.
		
		this.gameState.censusData.subscribeToDistrict(x, y, (d) => this.onDistrictChange(d));
	};

	onDistrictChange(district) {
		this.setEnvironmentalDamage(district.clr, district.lvl);
	}

	setEnvironmentalDamage(clr, lvl) {
		if (clr !== this.clrName) {
			this.envDmg = lvl * this.envDmgSus;
		} else if (!this.noClrSurivor && lvl === 0) {
			this.envDmg = this.envDmgSus;
		} else {
			this.envDmg = 0;
		}
	}
	setDestination(x, y) {
		this.destX = x;
		this.destY = y;
	}
	generateEvents(time) {
		//this method returns an array of events
		let events = []
		if (this.destX !== this.x || this.destY !== this.y) {
			events.push(this.performMoveEvent());
		}
		if (this.readyForEnvironmentalDamage(time)) {
			events.push(this.performEnvironmentalDamageEvent(time));
		}
		if (this.health <= 0) {
			events.push(this.performDestroyEvent());
		}
		return events;
	}

	performMoveEvent() {
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
			unitId: this.id
		};
	}
	performDestroyEvent() {
		//remove self from array (should self be dong this?)
		var i = this.gameState.gameUnits.indexOf(this);
		this.gameState.gameUnits.splice(i, 1);
		//return event
		return {
			type: 'destroyUnit',
			unitId: this.id
		};
	}
	readyForEnvironmentalDamage(time) {
		return this.envDmg > 0 && time - this.lastEnvDmgTimestamp >= 1000;
	}
	performEnvironmentalDamageEvent(time) {
		this.takeDamage(this.envDmg);
		this.lastEnvDmgTimestamp = time;
		return {
			type: 'envDmg',
			unitId: this.id,
			amount: this.envDmg
		};
	}
	needsHealing() {
		return this.health < this.maxHealth;
	}
	takeHealing(amount) {
		this.health += amount;
		if (this.health > this.maxHealth)
			this.health = this.maxHealth;
	}
	takeDamage(amount) {
		this.health -= amount;
	}
	toJSON() {
		return {
			id: this.id,
			ownerId: this.ownerId,
			type: this.type,
			x: this.x,
			y: this.y,
		};
	}
}

module.exports = Unit;