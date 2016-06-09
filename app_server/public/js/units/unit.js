class Unit {
    constructor(x, y, id, ownerId, spriteImage, maxHealth, onKilled) {
        this.sprite = game.add.isoSprite(x, y, 0, spriteImage, 0, game.units.group);
        this.sprite.anchor.setTo(0.5, 0.75); //1-((tower.width/4)/tower.height));

        this.sprite.inputEnabled = true;
        this.sprite.input.useHandCursor = true;
        this.sprite.events.onInputDown.add(()=>console.log(this.type));
        
        this.health = new HealthBar(16, this, maxHealth);//16 needs to be calculated based on the size of the sprite
        this.environmentalDamage = 0;

        this.onKilled = onKilled;
        this.id = id;
        this.ownerID = ownerId;

        let thisClr = game.players.getClr(ownerId);
        let tileX = Math.round(x * 0.03125); //0.03125 = 1/32
        let tileY = Math.round(y * 0.03125);
        this.censusTile = game.gameBoardLayer.gameBoardCensus.tiles[tileX + tileY * 64];
        this.censusTile.onChangeCallback = (newClr, newValue) => {
            if ((!Utility.compareClr(newClr, thisClr))) {
                this.environmentalDamage = Math.round(newValue * 0.25); // 0.25 = 1/4
            } else {
                this.environmentalDamage = 0;
            }
        };
    }
    processEvent(event) {
        if (event.type === 'moveUnit') {
            this.x = event.x;
            this.y = event.y;
        }
    }
    takeEnvironmentalDamage() {
        if (this.environmentalDamage) {
            this.health.takeDamage(this.environmentalDamage);
        }
    }
    kill() {
        //need to unregister from the residents census array, if it's ever in there.
        //game.gameBoardLayer.gameBoardCensus.tiles[tileX + tileY * 64].residents.indexOf('sprinkler')
        this.censusTile.onChangeCallback = null;
        this.sprite.destroy();
        this.onKilled(this.id);
    }
}