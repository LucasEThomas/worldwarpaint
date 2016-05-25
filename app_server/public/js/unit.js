class Unit {
    constructor(x, y, id, ownerId, type, onKilled) {
        this.sprite = game.add.isoSprite(x, y, 0, 'tower', 0, game.units.group);
        this.sprite.anchor.setTo(0.5, 0.75); //1-((tower.width/4)/tower.height));

        //        this.sprite.inputEnabled = true;
        //        sprite.events.onInputDown.add(() => {
        //            this.health.takeDamage(10);
        //        }, this.health);

        this.health = new HealthBar(16, this, 100, 100);

        this.onKilled = onKilled;
        this.id = id;
        this.ownerID = ownerId;
        this.type = type;

        let thisClr = game.players.getClr(ownerId);
        let tileX = Math.round(x * 0.03125); //0.03125 = 1/32
        let tileY = Math.round(y * 0.03125);
        this.censusTile = game.gameBoardLayer.gameBoardCensus.tiles[tileX + tileY * 64];
        console.log(this.censusTile);
        this.censusTile.onChangeCallback = (currentClr, change) => {
            if ((!Utility.compareClr(currentClr, thisClr) && change > 0) || (Utility.compareClr(currentClr, thisClr) && change < 0)) {
                game.gameBoardLayer.stageSplatter(x, y, 16, thisClr, 64);
                this.health.takeDamage(5);
            }
        };
    }
    processEvent(event) {
        if (event.type === 'sprinklerUnit') {
            let clrName = game.players.getClrName(event.ownerId);
            let clr = game.players.getClr(event.ownerId);
            event.data.forEach((splatter, n) => {
                let startPoint = new Victor(this.sprite.isoX, this.sprite.isoY);
                let endPoint = new Victor(splatter.x, splatter.y);
                //start points in a circle around the top of the tower
                let newStart = new Victor(13, 13).rotate(endPoint.subtract(startPoint).angle()).add(startPoint);
                Unit.lobProjectile(newStart.x, newStart.y, 45, splatter.x, splatter.y, 0, 50, 750, 'projectile_' + clrName, () => {
                    game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
                });
            });
        }
    }
    kill() {
        //need to unregister from the residents census array, if it's ever in there.
        //game.gameBoardLayer.gameBoardCensus.tiles[tileX + tileY * 64].residents.indexOf('sprinkler')
        this.censusTile.onChangeCallback = null;
        this.sprite.destroy();
        this.onKilled(this.id);
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
class UnitsManager {
    constructor() {
        this.units = [];
        this.group = game.add.group();
    }
    newTower(x, y, id, ownerId, type, onKill) {
        this.units.push(new Unit(x, y, id, ownerId, type, (id)=>{
            this.destroyUnit(id);
            onKill(id);
        }));
    }
    destroyUnit(id) {
        let killIndex = this.units.map((u) => u.id).indexOf(id);
        this.units.splice(killIndex, 1);
    }
    processEvent(event) {
        //this logic should be somewhere else... but here's fine for now :) 
        if (event.type === 'sprinklerUnit') {
            let unit = this.units.find((t) => t.id === event.unitId)
            if(unit){
                unit.processEvent(event);
            }
        } else if (event.type === 'manualSplatter') {
            let clr = game.players.getClr(event.ownerId);
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
class HealthBar {
    constructor(verticalOffset, parentUnit, maxHealth, currentHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.parentUnit = parentUnit;
        let parentSprite = this.parentSprite = parentUnit.sprite;

        let x = maxHealth * -0.5;
        let y = verticalOffset;

        this.whiteBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarWhite'));
        this.whiteBar.scale.setTo(maxHealth, 3);

        this.greenBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarGreen'));
        this.greenBar.scale.setTo(currentHealth, 3);

        this.redBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarRed'));
        this.redBar.scale.setTo(0, 3);
        this.tween = game.add.tween(this.redBar);
        this.tween.to({
            alpha: 0.2
        }, 500, Phaser.Easing.Cubic.In);
        this.tween.onComplete.add(() => {
            this.redBar.scale.setTo(0, 3);
        });

        this.blueBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarBlue'));
        this.blueBar.scale.setTo(0, 3);
    }
    takeDamage(amount) {
        if (amount < 0) amount = 0;
        else if (amount >= this.currentHealth) amount = this.currentHealth;

        this.parentSprite.tint = 0xff7777;
        setTimeout(() => {
            this.parentSprite.tint = 0xffffff;
        }, 150);

        let newHealth = (this.currentHealth - amount) > 0 ? (this.currentHealth - amount) : 0;
        this.greenBar.scale.setTo(newHealth, 3);
        this.redBar.x = this.whiteBar.x + this.currentHealth - amount;
        this.redBar.scale.setTo(this.redBar.width + amount, 3);
        this.redBar.alpha = 1;
        this.tween.stop();
        this.tween.pendingDelete = false;
        this.tween.timeline[0].startTime = Date.now();
        this.tween.start();

        this.currentHealth = newHealth;
        if (this.currentHealth <= 0) {
            this.parentUnit.kill();
        }
    }
    takeHealing(amount) {
        if (amount < 0) amount = 0;
        let newHealth = (this.currentHealth + amount) <= this.maxHealth ? (this.currentHealth + amount) : maxHealth;
        this.greenBar.scale.setTo(newHealth, 3);
        this.currentHealth = newHealth;
    }
    setNewHealth(value) {
        //clamp value between 0 and max health
        if (value <= 0) value = 0;
        else if (value > this.maxHealth) value = this.maxHealth;
        this.greenBar.scale.setTo(value, 3);
        this.currentHealth = value;
    }
    setNewMaxHealth(value) {
        if (value <= 0) value = 0;
        let newX = value * -0.5;
        this.whiteBar.scale.setTo(value, 3);
        this.whiteBar.x = this.greenBar.x = newX
        this.maxHealth = value;
    }
}