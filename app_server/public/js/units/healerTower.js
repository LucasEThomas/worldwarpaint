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
                let newStart = new Victor(16, 0).rotate(endPoint.clone().subtract(startPoint).angle()).add(startPoint);

                newStart.z = 35;
                endPoint.z = 0;

                HealerTower.fireHealRay(newStart, endPoint, () => {
                    //target.health.takeHealing(event.healing);
                });
            }
        }
    }

    static fireHealRay(startPointIsoSpace, endPointIsoSpace, impactCallback) {
        let directionVectorIso = endPointIsoSpace.clone().subtract(startPointIsoSpace);

        let startPoint = Victor.fromObject(game.iso.project({
            x: startPointIsoSpace.x,
            y: startPointIsoSpace.y,
            z: startPointIsoSpace.z
        }));

        let endPointIso1 = new Victor(16, 0).rotate(directionVectorIso.angle() + Math.TWOPI * 0.25).add(endPointIsoSpace);
        let endPointIso2 = new Victor(16, 0).rotate(directionVectorIso.angle() - Math.TWOPI * 0.25).add(endPointIsoSpace);
        endPointIso1.z = 0;
        endPointIso2.z = 0;

        let endPoint1 = Victor.fromObject(game.iso.project({
            x: endPointIso1.x,
            y: endPointIso1.y,
            z: 0
        }));
        let endPoint2 = Victor.fromObject(game.iso.project({
            x: endPointIso2.x,
            y: endPointIso2.y,
            z: 0
        }));

        let endPoint1Final = Victor.fromObject(game.iso.project({
            x: endPointIso1.x,
            y: endPointIso1.y,
            z: 50
        }));
        let endPoint2Final = Victor.fromObject(game.iso.project({
            x: endPointIso2.x,
            y: endPointIso2.y,
            z: 50
        }));

        let scale1 = startPoint.distance(endPoint1) - 35;
        let scale2 = startPoint.distance(endPoint2) - 35;

        let scale1Final = startPoint.distance(endPoint1Final) - 35;
        let scale2Final = startPoint.distance(endPoint2Final) - 35;

        let angle1 = endPoint1.clone().subtract(startPoint).angleDeg();
        let angle2 = endPoint2.clone().subtract(startPoint).angleDeg();

        let angle1Final = endPoint1Final.clone().subtract(startPoint).angleDeg();
        let angle2Final = endPoint2Final.clone().subtract(startPoint).angleDeg();

        if (angle1 - angle1Final > 180)
            angle1Final += 360;
        if (angle1 - angle1Final < -180)
            angle1 += 360;
        if (angle2 - angle2Final > 180)
            angle2Final += 360;
        if (angle2 - angle2Final < -180)
            angle2 += 360;

        let sprite1 = game.add.sprite(startPoint.x, startPoint.y);
        sprite1.scale.setTo(1, 0.5);
        let startSprite1 = sprite1.addChild(game.make.sprite(0, 0, 'healer_end'));
        startSprite1.blendMode = PIXI.blendModes.ADD;
        let beamSprite1 = sprite1.addChild(game.make.sprite(11, 0, 'healer_beam'));
        beamSprite1.scale.setTo(scale1, 1);
        let endSprite1 = sprite1.addChild(game.make.sprite(scale1 + 22, 20, 'healer_end'));
        endSprite1.angle = 180;
        sprite1.angle = angle1;
        sprite1.anchor.y = 0.5;
        sprite1.pivot.y = 0.5;

        beamSprite1.blendMode = PIXI.blendModes.ADD;
        startSprite1.blendMode = PIXI.blendModes.ADD;
        endSprite1.blendMode = PIXI.blendModes.ADD;



        let sprite2 = game.add.sprite(startPoint.x, startPoint.y);
        sprite2.scale.setTo(1, 0.5);
        let startSprite2 = sprite2.addChild(game.make.sprite(0, 0, 'healer_end'));
        startSprite2.blendMode = PIXI.blendModes.ADD;
        let beamSprite2 = sprite2.addChild(game.make.sprite(11, 0, 'healer_beam'));
        beamSprite2.scale.setTo(scale2, 1);
        let endSprite2 = sprite2.addChild(game.make.sprite(scale2 + 22, 20, 'healer_end'));
        endSprite2.angle = 180;

        sprite2.angle = angle2;
        sprite2.anchor.y = 0.5;
        sprite2.pivot.y = 0.5;

        beamSprite2.blendMode = PIXI.blendModes.ADD;
        startSprite2.blendMode = PIXI.blendModes.ADD;
        endSprite2.blendMode = PIXI.blendModes.ADD;

        let spriteTween1 = game.add.tween(sprite1).to({
            angle: angle1Final,
            alpha: 0
        }, 1000, null, true).onComplete.add(() => {
            sprite1.destroy();
        });

        let lengthTween1 = game.add.tween(beamSprite1.scale).to({
            x: scale1Final
        }, 1000, null, true);

        let endTween1 = game.add.tween(endSprite1).to({
            x: scale1Final + 22
        }, 1000, null, true);

        let spriteTween2 = game.add.tween(sprite2).to({
            angle: angle2Final,
            alpha: 0
        }, 1000, null, true).onComplete.add(() => {
            sprite2.destroy();
        });

        let lengthTween2 = game.add.tween(beamSprite2.scale).to({
            x: scale2Final
        }, 1000, null, true);

        let endTween2 = game.add.tween(endSprite2).to({
            x: scale2Final + 22
        }, 1000, null, true);

        impactCallback();
    }
}