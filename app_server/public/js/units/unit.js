class Unit {
    constructor(x, y, id, ownerId, spriteImage, maxHealth, onKilled) {
        this.sprite = game.add.isoSprite(x, y, 0, spriteImage, 0, game.units.group);
        this.sprite.anchor.setTo(0.5, 0.75); //1-((tower.width/4)/tower.height));

        this.sprite.inputEnabled = true;
        this.sprite.input.useHandCursor = true;
        this.sprite.events.onInputDown.add(()=>game.groundEffects.displayUnitRange(x, y, 100));
        
        this.health = new HealthBar(16, this, maxHealth);//16 needs to be calculated based on the size of the sprite

        this.onKilled = onKilled;
        this.id = id;
        this.ownerID = ownerId;
    }
    processEvent(event) {
        if (event.type === 'moveUnit') {
            this.x = event.x;
            this.y = event.y;
        }
		else if (event.type === 'destroyUnit'){
			this.kill();
		}
		else if (event.type === 'envDmg'){
			this.health.takeDamage(event.amount);
		}
    }
    kill() {
        this.sprite.destroy();
        this.onKilled(this.id);
    }
}