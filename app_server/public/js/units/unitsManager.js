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
        }
        this.units.push(newUnit);
    }
    destroyUnit(id) {
        let killIndex = this.units.map((u) => u.id).indexOf(id);
        this.units.splice(killIndex, 1);
        if(this.onUnitKilled){
            this.onUnitKilled(id);
        }
    }
    processEvent(event) {
        //this logic should be somewhere else... but here's fine for now :) 
        if (event.type === 'sprinklerUnit') {
            let unit = this.units.find((t) => t.id === event.unitId)
            if (unit) {
                unit.processEvent(event);
            }
        } else if (event.type === 'manualSplatter') {
            let clr = game.players.getClr(event.ownerId);
            let splatter = event.data[0];
            game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
        } else if (event.type === 'moveUnit') {
            //todo, this needs to work in the isometic plugin.
            let tower = this.units.find((t) => t.id === event.data.id);
            tower.x = event.data.x;
            tower.y = event.data.y;
        }
    }
    damageTimerLoop() {
        this.units.forEach((unit, index) => {
            unit.takeEnvironmentalDamage();
        });
    }
    update() {
        game.iso.simpleSort(this.group);
    }
}