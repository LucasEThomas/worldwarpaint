class SprinklerTower extends Unit {
    constructor(x, y, id, ownerId, onKilled) {
        super(x, y, id, ownerId, 'tower', 100, onKilled);
        this.type = 'sprinklerTower';
        //game.groundEffects.displayUnitRange(x, y, 100);
    }
    processEvent(event) {
        super.processEvent(event);
        if (event.type === 'sprinkle') {
            let clrName = game.players.getClrName(event.ownerId);
            let clr = game.players.getClr(event.ownerId);
            let splatter = event;
            let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
            let endPoint = new Victor(splatter.x, splatter.y);
            //start points in a circle around the top of the tower
            let newStart = new Victor(12, 12).rotate(endPoint.subtract(startPoint).angle() - Math.TWOPI * 0.25).add(startPoint);
            SprinklerTower.lobProjectile(newStart.x, newStart.y, 45, splatter.x, splatter.y, 0, 50, 750, 'projectile_' + clrName, () => {
                game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
            });
        }
    }

    static lobProjectile(x1, y1, z1, x2, y2, z2, lobHeight, airTime, imageName, impactCallback) {
        let sprite = game.add.isoSprite(x1, y1, z1, imageName, 0, game.units.group);
        let linearTween = game.add.tween(sprite).to({
            isoX: x2,
            isoY: y2,
        }, airTime, null, true);
        linearTween.onComplete.add(() => {
            impactCallback();
            sprite.destroy();
        });
        let parabolicTween = game.add.tween(sprite).to({
            isoZ: [z1, z1 + lobHeight, z1 + lobHeight, z2]
        }, airTime, null, true).interpolation(Phaser.Math.bezierInterpolation);

        sprite.update = () => {
            let tileX = Math.floor(sprite.isoX * 0.03125);
            let tileY = Math.floor(sprite.isoY * 0.03125);
            let censusResidents = game.gameBoardLayer.gameBoardCensus.tiles[tileX + tileY * 64].residents;
            if (censusResidents.indexOf('tree') >= 0) {
                linearTween.stop();
                parabolicTween.stop();
                sprite.destroy();
            }
        }
    }
}