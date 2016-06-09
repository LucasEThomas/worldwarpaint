class SniperTower extends Unit {
    constructor(x, y, id, ownerId, onKilled) {
        super(x, y, id, ownerId, 'tower', 100, onKilled);
        this.type = 'sniperTower';
    }
    processEvent(event) {
        super.processEvent(event);
        if (event.type === 'snipe') {

            let target = game.units.units.find((u) => u.id === event.targetId);
            if (target) {
                let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                let endPoint = new Victor(target.sprite.isoX, target.sprite.isoY);
                //start points in a circle around the top of the tower
                let newStart = new Victor(12, 12).rotate(endPoint.clone().subtract(startPoint).angle() - Math.TWOPI * 0.25).add(startPoint);

                SniperTower.fireLaser({
                    x: newStart.x,
                    y: newStart.y,
                    z: 35
                }, {
                    x: endPoint.x,
                    y: endPoint.y,
                    z: 0
                }, () => {
                    target.health.takeDamage(event.damage);
                });
            }
        }
    }
    static fireLaser(startPointIsoSpace, endPointIsoSpace, impactCallback) {
        let startPoint = Victor.fromObject(game.iso.project(startPointIsoSpace));
        let endPoint = Victor.fromObject(game.iso.project(endPointIsoSpace));

        let distance = startPoint.distance(endPoint) - 15;
        let angle = endPoint.clone().subtract(startPoint).angleDeg();

        let sprite = game.add.sprite(startPoint.x, startPoint.y);
        sprite.scale.setTo(1, 0.5)
        let startSprite = sprite.addChild(game.make.sprite(0, 0, 'laser_end'));
        startSprite.blendMode = PIXI.blendModes.ADD;
        let beamSprite = sprite.addChild(game.make.sprite(10, 0, 'laser_beam'));
        beamSprite.scale.setTo(distance, 1);
        let endSprite = sprite.addChild(game.make.sprite(distance + 20, 20, 'laser_end'));
        endSprite.angle = 180;

        beamSprite.blendMode = PIXI.blendModes.ADD;
        startSprite.blendMode = PIXI.blendModes.ADD;
        endSprite.blendMode = PIXI.blendModes.ADD;

        sprite.angle = angle;
        let linearTween = game.add.tween(sprite).to({
            alpha: 0,
        }, 500, null, true).onComplete.add(() => {
            sprite.destroy();
        });

        impactCallback();
    }
}