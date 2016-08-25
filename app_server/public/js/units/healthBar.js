class HealthBar {
    constructor(verticalOffset, parentUnit, maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.parentUnit = parentUnit;
        let parentSprite = this.parentSprite = parentUnit.sprite;

        let x = maxHealth * -0.5;
        let y = verticalOffset;

        this.whiteBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarWhite'));
        this.whiteBar.scale.setTo(maxHealth, 3);
        
        this.greenBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarGreen'));
        this.greenBar.scale.setTo(this.currentHealth, 3);

        this.redBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarRed'));
        this.redBar.alpha = 0;
        this.redBar.scale.setTo(1, 3);
        this.tween = game.add.tween(this.redBar);
        this.tween.to({
            alpha: 0.2
        }, 500, Phaser.Easing.Cubic.In);
        this.tween.onComplete.add(() => {
            this.redBar.alpha = 0;
            this.redBar.scale.setTo(1,3);
        });

        this.blueBar = parentSprite.addChild(game.make.sprite(x, y, 'healthBarBlue'));
        this.blueBar.scale.setTo(1, 3);
        this.blueBar.alpha = 0;
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
        let newHealth = (this.currentHealth + amount) <= this.maxHealth ? (this.currentHealth + amount) : this.maxHealth;
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