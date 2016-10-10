class UnitsManager {
    constructor(onUnitKilled) {
        this.onUnitKilled;
        this.units = [];
        this.group = game.add.group();
    }
    newTower(x, y, id, ownerId, type, onKill) {
        console.log(towerClasses);
        console.log(type);
        let towerType = towerClasses.find((a) => a.name === type);
        let newUnit = new Unit(towerType.name, id, x, y, towerType.spriteName, ownerId, towerType.maxHealth, towerType.processEvent, (id) => this.destroyUnit(id));
        this.units.push(newUnit);
    }
    destroyUnit(id) {
        let killIndex = this.units.map((u) => u.id).indexOf(id);
        this.units.splice(killIndex, 1);
        if (this.onUnitKilled) {
            this.onUnitKilled(id);
        }
    }
    update() {
        game.iso.simpleSort(this.group);
    }
}