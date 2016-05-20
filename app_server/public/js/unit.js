class Unit {
    constructor(x, y, id, ownerId, type) {
        this.sprite = game.add.isoSprite(x, y, 0, 'tower', 0, game.units.group);
        this.sprite.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));

        this.id = id;
        this.ownerID = ownerId;
        this.type = type;
    }
    processEvent(event) {
        if (event.type === 'sprinklerUnit') {
            let clr = game.players.getClr(event.ownerID);
            event.data.forEach((splatter, n) => {
                new projectile(game, this.sprite.isoX, this.sprite.isoY, 60, splatter.x, splatter.y, 0, 200, 750, () => {
                    game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
                });

            });
        }
    }
}
class UnitsManager {
    constructor() {
        this.units = [];
        this.group = game.add.group();
    }
    newTower(x, y, id, ownerId, type) {
        this.units.push(new Unit(x, y, id, ownerId, type));
    }
    processEvent(event) {
        //this logic should be somewhere else... but here's fine for now :) 
        if (event.type === 'sprinklerUnit') {
            this.units.find((t) => t.id === event.unitId).processEvent(event);
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
    update() {
        game.iso.simpleSort(this.group);
    }
}
class projectile {
    constructor(game, x1, y1, z1, x2, y2, z2, lobHeight, airTime, impactCallback) {
        let distance = new Victor(x1, y1).distance(new Victor(x2, y2));
        let sprite = game.add.isoSprite(x1, y1, z1, 'projectile', 0, game.units.group);
        let linearTween = game.add.tween(sprite).to({
            isoX: x2,
            isoY: y2,
        }, airTime, null, true);
        linearTween.onComplete.add(() => {
            impactCallback();
            sprite.destroy();
        });
        let parabolicTween = game.add.tween(sprite).to({
            isoZ: [z1, lobHeight, lobHeight, z2]
        }, airTime, null, true).interpolation(Phaser.Math.bezierInterpolation);

    }
}