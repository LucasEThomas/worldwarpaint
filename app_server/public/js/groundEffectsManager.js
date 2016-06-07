class GroundEffectsManager {
    constructor(game) {
        this.groundEffectsGroup = game.add.group();
    }
    displayUnitRange(x, y, maxRange) {
        //  Our BitmapData (same size as our canvas)
        let width = 300 * Math.sqrt(3) / Math.sqrt(2);
        let height = 300 / Math.sqrt(2);

        let bmd = game.make.bitmapData(width, height);

        //  Create the Circles
        let innerCircle = new Phaser.Circle(0, 0, 100);
        let outerCircle = new Phaser.Circle(0, 0, 150);

        let gradient = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
        gradient.addColorStop(0, 'rgba(20,230,150,0)');
        gradient.addColorStop(1, 'rgba(20,230,150,80)');

        //bmd.rect(0, 0, width, height, 'rgba(240,0,0,70)');

        bmd.context.setTransform(Math.sqrt(3), 1, -Math.sqrt(3), 1, width / 2, height / 2);
        bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, gradient);

        let sprite = game.add.isoSprite(x, y, 0, bmd, 0, this.groundEffectsGroup);
        sprite.anchor.setTo(0.5);
    }
}