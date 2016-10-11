//in the end, this array will be compiled on the server, but for now it's all in this file.
var towerClasses = [
    {
        name: 'sprinklerTower',
        processEvent: function(event) {
            if (event.type === 'sprinkle') {
                let clrName = game.players.getClrName(event.ownerId);
                let clr = game.players.getClr(event.ownerId);
                let splatter = event;
                let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                let endPoint = new Victor(splatter.x, splatter.y);
                //start points in a circle around the top of the tower
                let newStart = new Victor(22, 22).rotate(endPoint.subtract(startPoint).angle() - Math.TWOPI * 0.25).add(startPoint);
                game.airEffects.lobProjectile(newStart.x, newStart.y, 45, splatter.x, splatter.y, 0, 50, 750, 'projectile_' + clrName, () => {
                    game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
                });
            }
        },
        spriteName: 'brushTower',
        animations:[
            {
                name: 'spin',
                generateFramesArgs: ['', 1, 32, '.png', 4],
                numOfFrames: 32,
            }
        ],
        maxHealth: 100
    },
    {
        name: 'sniperTower',
        processEvent: function(event) {
            if (event.type === 'snipe') {

                let target = game.units.units.find((u) => u.id === event.targetId);
                if (target) {
                    let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                    let endPoint = new Victor(target.sprite.isoX, target.sprite.isoY);
                    //start points in a circle around the top of the tower
                    let newStart = new Victor(12, 12).rotate(endPoint.clone().subtract(startPoint).angle() - Math.TWOPI * 0.25).add(startPoint);

                    game.airEffects.fireLaser({
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
        },
        spriteName: 'tower',
        maxHealth: 100
    },
    {
        name: 'healerTower',
        processEvent: function(event) {
            if (event.type === 'heal') {

                let target = game.units.units.find((u) => u.id === event.targetId);
                if (target) {
                    let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                    let endPoint = new Victor(target.sprite.isoX, target.sprite.isoY);
                    //start points in a circle around the top of the tower
                    let newStart = new Victor(16, 0).rotate(endPoint.clone().subtract(startPoint).angle()).add(startPoint);

                    newStart.z = 35;
                    endPoint.z = 0;

                    //console.log(event);
                    game.airEffects.fireHealRay(newStart, endPoint, () => {
                        target.health.takeHealing(event.amount);
                    });
                }
            }
        },
        spriteName: 'tower',
        maxHealth: 100
    }
];