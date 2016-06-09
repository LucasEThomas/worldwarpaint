class GameInputs {
    constructor(abilities) {
        this.buttons = [];
        this.abilityCursor;

        this.MAP_SCROLL_SPEED = 16;
        this.keys = game.input.keyboard.createCursorKeys();
        this.keys.W = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.keys.S = game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.keys.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.keys.D = game.input.keyboard.addKey(Phaser.Keyboard.D);

        this.keys.shift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        this.keys.esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

        game.canvas.oncontextmenu = this.rightMouseUp;

        abilities.forEach((ability, n) => {
            let button = game.add.sprite(30, 150 + 60 * n, ability.image);
            button.fixedToCamera = true;
            button.anchor.setTo(0.5, 0.5);
            button.inputEnabled = true;
            button.events.onInputDown.add(() => this.useAbility(ability));
            this.buttons.push(button);
        });
    }
    useAbility(ability) {
        if (ability.cost <= game.money.amount) {
            game.money.amount -= ability.cost; //subtract the immediate cost
            if (ability.usageCallback) { //any action that happens immediately after the ability is selected
                ability.usageCallback();
            }
            if (ability.onClickOptions) {
                let options = ability.onClickOptions;

                if (options.inIsoUnitsGroup) {
                    this.abilityCursor = game.add.isoSprite(0, 0, 0, options.imageName, 0, game.units.group);
                    this.abilityCursor.inputEnabled = false;
                    this.abilityCursor.anchor.setTo(0.5, 0.84);
                    this.abilityCursor.alpha = options.alpha;
                } else {
                    this.abilityCursor = game.add.isoSprite(0, 0, 0, options.imageName, 0, game.units.group);
                    this.abilityCursor.inputEnabled = false;
                    this.abilityCursor.anchor.setTo(0.5, 0.5);
                    this.abilityCursor.alpha = options.alpha;
                }
                this.abilityCursor.onClickOptions = options;
            }
        }
    }
    mouseUp() {
        if (this.abilityCursor) {
            //if the ability doesn't have to happen on the player's color, then just do it
            let options = this.abilityCursor.onClickOptions;
            if (options.cost <= game.money.amount) {
                if (!options.mustColorMatch) {
                    game.money.amount -= options.cost;
                    options.onClickCallback(this.abilityCursor.isoX, this.abilityCursor.isoY)
                    if (!this.keys.shift.isDown) {
                        this.abilityCursor.destroy();
                        this.abilityCursor = null;
                    }
                }
                //else if the ability must happen on the player's color and it has, then do it
                else if (game.gameBoardLayer.gameBoardGraphics.colorMatch(this.abilityCursor.isoX, this.abilityCursor.isoY, game.player.clr)) {
                    game.money.amount -= options.cost;
                    options.onClickCallback(this.abilityCursor.isoX, this.abilityCursor.isoY)
                    if (!this.keys.shift.isDown) {
                        this.abilityCursor.destroy();
                        this.abilityCursor = null;
                    }
                }
                //else if, the ability must happen on the player's color, but it hasn't, and the user doesn't have the shift key pressed, then cancel
                else if (!this.keys.shift.isDown) {
                    this.abilityCursor.destroy();
                    this.abilityCursor = null;
                }
            }
        } else {
            //this is just for dev purposes for now.
            if (this.keys.shift.isDown) {
                var point = game.iso.unproject(game.input.activePointer.position);
                game.gameServer.manualSplatter(point.x, point.y, 50, game.player.id);
            }
            else{
                let point = game.iso.unproject(game.input.activePointer.position)
                console.log(game.gameBoardLayer.gameBoardGraphics.colorMatch(point.x, point.y, game.player.clr));
            }



        }
    }
    rightMouseUp(e) {
        console.log('right click');
        e.preventDefault();
        if (game.player.type === 'champion' || game.player.type === 'archer')
            game.gameServer.moveHero(game.input.worldX, game.input.worldY);
    }


    update() {
        if (this.keys.up.isDown || this.keys.W.isDown)
            game.camera.y -= this.MAP_SCROLL_SPEED;
        if (this.keys.down.isDown || this.keys.S.isDown)
            game.camera.y += this.MAP_SCROLL_SPEED;
        if (this.keys.left.isDown || this.keys.A.isDown)
            game.camera.x -= this.MAP_SCROLL_SPEED;
        if (this.keys.right.isDown || this.keys.D.isDown)
            game.camera.x += this.MAP_SCROLL_SPEED;

        if (this.keys.esc.isDown) {
            if (this.abilityCursor) {
                this.abilityCursor.destroy();
                this.abilityCursor = null;
            }
        }

        if (this.abilityCursor) {
            let point = game.iso.unproject(game.input.activePointer.position);
            let snap = this.abilityCursor.onClickOptions.snap
            this.abilityCursor.isoX = 60 + snap + point.x - (point.x % snap);
            this.abilityCursor.isoY = 60 +snap + point.y - (point.y % snap);
        }
    }

}