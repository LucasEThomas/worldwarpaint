class GroundEffectsManager {
    constructor(game) {
        this.groundEffectsGroup = game.add.group();
    }
    displayUnitRange(x, y, maxRange) {
        this.groundEffectsGroup.removeAll();
        
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
    animateSplatter(x, y, scale, clrHex){
        let sprite = game.add.isoSprite(x, y, 0, 'splattersAnimated', 0, this.groundEffectsGroup);
        sprite.anchor.setTo(0.5);

        sprite.tint = parseInt('0x' + clrHex.substring(1))
        sprite.alpha = 0.8

        sprite.transformCallback = (matrix=>{
            matrix.a = 1.73 * scale //sqrt(3) = 1.73
            matrix.b = 1 * scale
            matrix.c = -1.73 * scale
            matrix.d = 1 * scale
        })

        let randomSplatterIndex = Math.rangeInt(0,7)

        let frames = [0, 1, 2, 3, 4, 5, 6, 7].map( index => index + (8 * randomSplatterIndex))

        sprite.animations.add('splatterAnimated', frames, 10, true)
        sprite.play('splatterAnimated', 20, false)
        sprite.animations.currentAnim.onComplete.add( () => sprite.destroy(), this)
        game.add.tween(sprite).to( { alpha: 0 }, 500, "Linear", true);
    }
}