class GameInputs {
    constructor(abilities) {
        this.buttons = [];
        this.abilityCursor;

        this.MAP_SCROLL_SPEED = 16;
        this.arrowKeys = game.input.keyboard.createCursorKeys();

        abilities.forEach((ability, n) => {
            var button = game.add.sprite(0, 0, ability.image);
            button.fixedToCamera = true;
            button.cameraOffset.setTo(30, 150 + 60 * n);
            button.anchor.setTo(0.5, 0.5);
            button.inputEnabled = true;
            button.events.onInputDown.add(() => this.useAbility(ability));
            this.buttons.push(button);
        });
    }
    useAbility(ability) {
        if (ability.usageCallback) { //any action that happens immediately after the ability is selected
            ability.usageCallback();
        }
        if (ability.onClickOptions) {
            let options = ability.onClickOptions;
            if (options.inIsoUnitsGroup) {
                this.abilityCursor = game.add.isoSprite(0, 0, 0, options.imageName, 0, game.unitsGroup);
                this.abilityCursor.inputEnabled = false;
                this.abilityCursor.anchor.setTo(0.5, 0.84);
                this.abilityCursor.alpha = options.alpha;
            } else {
                this.abilityCursor = game.add.isoSprite(0, 0, 0, options.imageName, 0, game.unitsGroup);
                this.abilityCursor.inputEnabled = false;
                this.abilityCursor.anchor.setTo(0.5, 0.5);
                this.abilityCursor.alpha = options.alpha;
            }
            this.abilityCursor.onClickOptions = options;
        }
    }
    mouseUp() {
        if (this.abilityCursor) {
            if (!this.abilityCursor.onClickOptions.mustColorMatch || game.gameBoardLayer.gameBoardGraphics.colorMatch(game.input.worldX, game.input.worldY, game.player.clr)) {
                this.abilityCursor.onClickOptions.onClickCallback(this.abilityCursor.isoX, this.abilityCursor.isoY)
                this.abilityCursor.destroy();
                this.abilityCursor = null;
            }
        } else {
            //this is just for dev purposes for now.
            var point = game.iso.unproject(game.input.activePointer.position);
            game.gameServer.manualSplatter(point.x, point.y, 50, game.player.id);
        }
    }

    update() {
        if (this.arrowKeys.up.isDown)
            game.camera.y -= this.MAP_SCROLL_SPEED;
        if (this.arrowKeys.down.isDown)
            game.camera.y += this.MAP_SCROLL_SPEED;
        if (this.arrowKeys.left.isDown)
            game.camera.x -= this.MAP_SCROLL_SPEED;
        if (this.arrowKeys.right.isDown)
            game.camera.x += this.MAP_SCROLL_SPEED;

        if (this.abilityCursor) {
            let point = game.iso.unproject(game.input.activePointer.position);
            let snap = this.abilityCursor.onClickOptions.snap
            this.abilityCursor.isoX = snap + point.x - (point.x % snap);
            this.abilityCursor.isoY = snap + point.y - (point.y % snap);
        }
    }

}