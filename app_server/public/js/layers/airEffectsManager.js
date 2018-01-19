class AirEffectsManager{
    constructor(game){
        this.airEffectsGroup = game.add.group();
    }
    
    fireLaser(startPointIsoSpace, endPointIsoSpace, impactCallback) {
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
    fireHealRay(startPointIsoSpace, endPointIsoSpace, impactCallback) {
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
    lobProjectile(x1, y1, z1, x2, y2, z2, lobHeight, airTime, imageName, impactCallback) {
        //impactCallback();
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
    fireLightningBolt( startPointIsoSpace, endPointIsoSpace, thickness, impactCallback) {

        let startingPoint = Victor.fromObject(game.iso.project(startPointIsoSpace));
        let endingPoint = Victor.fromObject(game.iso.project(endPointIsoSpace));

        let results = [], positions = [],
            tangent = endingPoint.subtract( startingPoint),
            normal  = tangent.clone().rotateBy(Math.TWOPI * 0.25).normalize(),
            length  = tangent.length(),
            SWAY = 80,
            JAGGEDNESS = 1 / SWAY,
            prevPoint = startingPoint, prevDisplacement = 0,
            i, len;
    
        positions.push(0);
    
        for( i = 0, len = length / 4; i < len; i++ ) {
            positions.push( Math.random() );
        }
    
        positions.sort();
    
        for( i = 1, len = positions.length; i < len; i++ ) {
    
            let pos = positions[i],
                // used to prevent sharp angles by ensuring very close positions also have small perpendicular variation.
                scale = ( length * JAGGEDNESS ) * ( pos - positions[i-1] ),
                // defines an envelope. Points near the middle of the branchLightning can be further from the central line.
                envelope = pos > 0.95 ? 20  * (  1 - pos ) : 1,
                displacement = Math.Rand( -SWAY, SWAY );
    
            displacement -= ( displacement - prevDisplacement ) * ( 1 - scale );
            displacement *= envelope;
    
            let point = startingPoint.add( tangent.divide( 1/pos ).add( normal.divide( 1/displacement ) ) );
    
            this.fireLaser( prevPoint, point, ()=>{});
    
            prevPoint = point;
            prevDisplacement = displacement;
        }
    
        this.fireLaser(prevPoint, endingPoint, ()=>{});
    
        impactCallback();
    };

    lightningSegment(startPoint, endPoint){
        let distance = startPoint.distance(endPoint) - 15;
        let angle = endPoint.clone().subtract(startPoint).angleDeg();

        let sprite = game.add.sprite(startPoint.x, startPoint.y);
        let startSprite = sprite.addChild(game.make.sprite(0, 0, 'laser_end'));
        let beamSprite = sprite.addChild(game.make.sprite(10, 0, 'laser_beam'));
        let endSprite = sprite.addChild(game.make.sprite(distance + 20, 20, 'laser_end'));

        sprite.scale.setTo(1, 0.5)
        beamSprite.scale.setTo(distance, 1);

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
    }
}
