class Unit {
    constructor() {

    }
}
class UnitsManager {
    constructor() {
        this.units = [];
        this.group = game.add.group();
    }
    newTower(x, y, id, ownerId, type) {
        var tower = game.add.isoSprite(x, y, 0, 'tower', 0, game.units.group);
        tower.id = id;
        // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
        tower.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));
        tower.ownerID = ownerId;
        tower.type = type;
        this.units.push(tower);
    }
    processEvent(event) {
        //this logic should be somewhere else... but here's fine for now :) 
        if (event.type === 'sprinklerUnit') {
            let clr = game.players.getClr(event.ownerID);
            event.data.forEach((splatter, n) => {
                game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
            });
        } else if (event.type === 'manualSplatter') {
            let clr = game.players.getClr(event.ownerID);
            let splatter = event.data[0];
            game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
        } else if (event.type === 'moveUnit') {
            //todo, this needs to work in the isometic plugin.
            let tower = this.units.find((t) => t.id === event.data.id);
            tower.x = event.data.x;
            tower.y = event.data.y;
        }
    }
    update(){
        game.iso.simpleSort(this.group);
    }
}