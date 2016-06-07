class HealerTower extends Unit {
    constructor(x, y, id, ownerId, onKilled) {
        super(x, y, id, ownerId, 'tower', 100, onKilled);
        this.type = 'healerTower';

        //        let sqrDistTo = (unit) => {
        //            let distX = this.sprite.isoX - unit.sprite.isoX;
        //            let distY = this.sprite.isoY - unit.sprite.isoY;
        //            let distSqr = Math.pow(distX, 2) + Math.pow(distY, 2);
        //            return distSqr;
        //        }
        //
        //        let testCanHeal = (unit) => {
        //            if (unit) {
        //                let maxRangeSqr = Math.pow(200, 2);
        //                let distSqr = sqrDistTo(unit);
        //
        //                return distSqr <= maxRangeSqr && unit.clrName === this.clrName && unit.id != this.id;
        //            } else {
        //                return false;
        //            }
        //        }
        //
        //        let targets = game.units.units.filter((nUnit) => testCanHeal(nUnit));
        //        targets.forEach((nTarget, n) => {
        //            HealerTower.healBeam({
        //                x: this.sprite.isoX,
        //                y: this.sprite.isoY,
        //                z: 35
        //            }, {
        //                x: nTarget.sprite.isoX,
        //                y: nTarget.sprite.isoY,
        //                z: 35
        //            });
        //        });

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

                HealerTower.fireHealRay({
                    x: newStart.x,
                    y: newStart.y,
                    z: 35
                }, {
                    x: endPoint.x,
                    y: endPoint.y,
                    z: 0
                }, () => {
                    //target.health.takeHealing(event.healing);
                });
            }
        }
    }

    static fireHealRay(startPointIsoSpace, endPointIsoSpace, impactCallback) {
        let startPoint = Victor.fromObject(game.iso.project(startPointIsoSpace));
        let endPoint1 = Victor.fromObject(game.iso.project(endPointIsoSpace));
        endPointIsoSpace.z = 35;
        let endPoint2 = Victor.fromObject(game.iso.project(endPointIsoSpace));

        let distance1 = startPoint.distance(endPoint1);
        let initialAngle = endPoint1.clone().subtract(startPoint).angleDeg();
        let finalAngle = endPoint2.clone().subtract(startPoint).angleDeg();

        let sprite = game.add.sprite(startPoint.x, startPoint.y);
        sprite.scale.setTo(1, 0.5)
        let startSprite = sprite.addChild(game.make.sprite(0, 0, 'healer_end'));
        startSprite.blendMode = PIXI.blendModes.ADD;
        let beamSprite = sprite.addChild(game.make.sprite(10, 0, 'healer_beam'));
        beamSprite.scale.setTo(distance1, 1);
        let endSprite = sprite.addChild(game.make.sprite(distance1, 0, 'healer_end'));

        beamSprite.blendMode = PIXI.blendModes.ADD;
        startSprite.blendMode = PIXI.blendModes.ADD;
        endSprite.blendMode = PIXI.blendModes.ADD;

        endSprite.x += 20;
        endSprite.y += 20;
        endSprite.angle = 180;


        sprite.baseAngle = initialAngle;
        let linearTween = game.add.tween(sprite).to({
            baseAngle: finalAngle,
            alpha: 0,
        }, 1000, null, true).onComplete.add(() => {
            sprite.destroy();
        });
        sprite.update = () => {
            sprite.angle = 10 * Math.random() + sprite.baseAngle;
        };

        impactCallback();
    }
}