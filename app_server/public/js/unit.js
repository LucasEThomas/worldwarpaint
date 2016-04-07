class Unit {
    constructor() {

    }
}
class UnitsManager {
    constructor() {
        this.towers = [];
    }
    newTower(x, y, id, ownerId, type) {
        var tower = game.add.isoSprite(x, y, 0, 'tower', 0, game.unitsGroup);
        tower.id = id;
        // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
        tower.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));
        tower.ownerID = ownerId;
        tower.type = type;
        this.towers.push(tower);
    }
}