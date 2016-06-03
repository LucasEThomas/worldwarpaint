class HealerTower extends Unit {
    constructor(x, y, id, ownerId, onKilled) {
        super(x, y, id, ownerId, 'tower', 100, onKilled);
        this.type = 'healerTower';
    }
    processEvent(event) {
        super.processEvent(event);
        if (event.type === 'heal') {

            let target = game.units.units.find((u) => u.id === event.targetId);
            if (target) {
                let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                let endPoint = new Victor(target.sprite.isoX, target.sprite.isoY);
                //start points in a circle around the top of the tower
                let newStart = new Victor(12, 12).rotate(endPoint.clone().subtract(startPoint).angle() - Math.TWOPI * 0.25).add(startPoint);

                HealerTower.fireLaser({
                    x: newStart.x,
                    y: newStart.y,
                    z: 35
                }, {
                    x: endPoint.x,
                    y: endPoint.y,
                    z: 0
                }, () => {
                    target.health.takeHealing(event.healing);
                });
            }
        }
    }
    static fireLaser(startPointIsoSpace, endPointIsoSpace, impactCallback) {
        let startPoint = Victor.fromObject(game.iso.project(startPointIsoSpace));
        let endPoint = Victor.fromObject(game.iso.project(endPointIsoSpace));

        let distance = startPoint.distance(endPoint);
        let angle = endPoint.clone().subtract(startPoint).angleDeg();

        let sprite = game.add.sprite(startPoint.x, startPoint.y);
        sprite.scale.setTo(1, 0.5)
        let startSprite = sprite.addChild(game.make.sprite(0, 0, 'healer_end'));
        startSprite.blendMode = PIXI.blendModes.ADD;
        let beamSprite = sprite.addChild(game.make.sprite(10, 0, 'healer_beam'));
        beamSprite.scale.setTo(distance, 1);
        let endSprite = sprite.addChild(game.make.sprite(distance, 0, 'healer_end'));

        beamSprite.blendMode = PIXI.blendModes.ADD;
        startSprite.blendMode = PIXI.blendModes.ADD;
        endSprite.blendMode = PIXI.blendModes.ADD;

        endSprite.x += 20;
        endSprite.y += 20;
        endSprite.angle = 180;

        sprite.angle = angle;
        let linearTween = game.add.tween(sprite).to({
            alpha: 0,
        }, 500, null, true).onComplete.add(() => {
            sprite.destroy();
        });

        impactCallback();
    }
}