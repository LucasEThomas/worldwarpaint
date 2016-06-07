class UnitsManager {
    constructor(onUnitKilled) {
        this.onUnitKilled;
        this.units = [];
        this.group = game.add.group();
        this.damageLoop = game.time.events.loop(Phaser.Timer.SECOND, this.damageTimerLoop, this);
    }
    newTower(x, y, id, ownerId, type, onKill) {
        let newUnit = null;
        if (type === 'sprinklerTower') {
            newUnit = new SprinklerTower(x, y, id, ownerId, (id) => this.destroyUnit(id));
        } else if (type == 'sniperTower') {
            newUnit = new SniperTower(x, y, id, ownerId, (id) => this.destroyUnit(id));
        } else if (type == 'healerTower') {
            newUnit = new HealerTower(x, y, id, ownerId, (id) => this.destroyUnit(id));
        }
        this.units.push(newUnit);
    }
    destroyUnit(id) {
        let killIndex = this.units.map((u) => u.id).indexOf(id);
        this.units.splice(killIndex, 1);
        if (this.onUnitKilled) {
            this.onUnitKilled(id);
        }
    }
    damageTimerLoop() {
        this.units.forEach((unit, index) => {
            if(unit)
                unit.takeEnvironmentalDamage();
        });
    }
    update() {
        game.iso.simpleSort(this.group);
    }
}