class GameBoardLayer {
    constructor(game) {
        var canvas = $('#gameboard_canvas')[0];
        this.gameBoardGraphics = new GameBoardGraphics(canvas);
        canvas = document.getElementById('gameboard_canvas');
        this.baseTexture = new PIXI.BaseTexture(canvas);
        var texture = new PIXI.Texture(this.baseTexture);
        var textureFrame = new Phaser.Frame(0, 0, 0, game.world.width, game.world.height, 'debug', game.rnd.uuid());
        this.sprite = game.add.sprite(0, 0, texture, textureFrame);
        this.sprite.fixedToCamera = false;
        this.sprite.inputEnabled = true;
        this.sprite.events.onInputUp.add(()=>game.gameInputs.mouseUp());
        
        this.stageOutputColors = [];
        this.stageInputRects = [];
        this.stageOutputRects = [];
    }

    stageSplatter(x, y, radius, clr, inputIndex) {
        if (inputIndex < 48) {
            this.stageInputRects.push({
                x: (inputIndex % 8) * 128,
                y: Math.floor(inputIndex / 8) * 128,
                width: 128,
                height: 128
            });
        } else if (inputIndex < 96) {
            this.stageInputRects.push({
                x: (inputIndex % 16) * 64,
                y: 768 + (Math.floor((inputIndex - 48) / 16) * 64),
                width: 64,
                height: 64
            });
        } else if (inputIndex < 160) {
            this.stageInputRects.push({
                x: (inputIndex % 32) * 32,
                y: 960 + (Math.floor((inputIndex - 96) / 32) * 32),
                width: 32,
                height: 32
            });
        } else {
            console.error("inputIndex out of bounds of spritesheet");
            return;
        }
        this.stageOutputColors.push(clr);
        this.stageOutputRects.push({
            x: x - radius,
            y: y - radius,
            width: radius * 2,
            height: radius * 2
        });
    }


    render() {
        if (this.stageOutputColors.length) {
            this.gameBoardGraphics.render(this.stageInputRects, this.stageOutputRects, this.stageOutputColors);
            this.stageInputRects = [];
            this.stageOutputRects = [];
            this.stageOutputColors = [];
        }
    }
}