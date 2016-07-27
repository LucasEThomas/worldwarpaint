class moneyManager {
    constructor() {
        this.amount = 0;
        this.rate = 0;
        
        var text = this.text = game.add.text(game.camera.width - 100, 20, "$0");
        text.anchor.setTo(1,0);
        text.fixedToCamera = true;
        
        text.font = 'Play';
        text.fontSize = 16;

        text.align = 'right';
        text.stroke = '#000000';
        text.strokeThickness = 2;
        text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        text.inputEnabled = true;
    }
    update() {
        this.amount += this.rate / 100;
        this.text.text = '$' + Math.floor(this.amount) + '\nrate:' + Math.round(this.rate*3600) + '/min';
    }
}