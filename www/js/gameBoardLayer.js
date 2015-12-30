gameBoardLayer = function() {

}

gameBoardLayer.initialize = function() {
    this.gameBoardBmd = game.add.bitmapData(game.world.width, game.world.height);

    //add it as a sprite object to the actual game so that we can see it.
    gameBoardLayerSprite = game.add.sprite(0, 0, this.gameBoardBmd);

    gameBoardLayerSprite.inputEnabled = true;
    gameBoardLayerSprite.events.onInputUp.add(gameBoardLayer.mouseUp);
}

gameBoardLayer.mouseUp = function() {
    //logic for placing towers goes here?
    if (towerDrag) {
        tower.towerPlaced();
    } else {
        gameBoardLayer.drawRandomBlob(game.input.worldX - 100, game.input.worldY, 50);
        gameBoardLayer.drawRandomSprinkles(game.input.worldX + 100, game.input.worldY, 50, 20);
        gameBoardLayer.drawRay(game.input.worldX, game.input.worldY, 200, Math.random() * 2 * Math.PI, Math.PI * 0.05);
    }
}

gameBoardLayer.gameBoardBmd; //The game board layer. This is the semi-transparent layer where the players' paint colors are drawn.

gameBoardLayer.drawRandomBlob = function(x, y, radius) {
    var tension = radius * 0.1;
    var controlPoints = gameBoardLayer.generateBlobControlPoints(x, y, radius, 32);

    gameBoardLayer.setupDraw();
    this.gameBoardBmd.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);

    for (var i = 0; i <= controlPoints.length - 1; i++) {
        var point = controlPoints[i];
        var prevPoint = controlPoints[(i > 0) ? i - 1 : controlPoints.length - 1];
        var nextPoint = controlPoints[(i + 1) % controlPoints.length];
        var nextnextPoint = controlPoints[(i + 2) % controlPoints.length];

        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);

        this.gameBoardBmd.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, nextPoint.x, nextPoint.y);
    }
    gameBoardLayer.doDraw();
}
gameBoardLayer.generateBlobControlPoints = function(x, y, radius, count) {
    var toReturn = [];
    for (var i = 0; i < count; i++) {
        var angle = 2 * Math.PI * i / count;
        var randomRadius = radius + radius * Math.getRandomArbitrary(-0.5, 0.5);
        toReturn.push(new Victor(Math.round(x + (randomRadius * Math.cos(angle))), Math.round(y + (randomRadius * Math.sin(angle)))))
    }
    return toReturn;
}

gameBoardLayer.drawRandomSprinkles = function(x, y, radius, count) {
    gameBoardLayer.setupDraw();
    for (var i = 0; i < count; i++) {
        var currentRadius = radius * Math.random();
        var currentDirection = 2 * Math.PI * Math.random();
        var currentX = x + (currentRadius * Math.cos(currentDirection));
        var currentY = y + (currentRadius * Math.sin(currentDirection));
        this.gameBoardBmd.ctx.moveTo(currentX, currentY);
        this.gameBoardBmd.ctx.arc(currentX, currentY, 3, 0, Math.PI * 2, false);
    }
    gameBoardLayer.doDraw();
}

gameBoardLayer.drawSprinkle = function(x, y, radius) {
    gameBoardLayer.setupDraw();
    this.gameBoardBmd.ctx.moveTo(x, y);
    this.gameBoardBmd.ctx.arc(x, y, 3, 0, Math.PI * 2, false);
    gameBoardLayer.doDraw();
}

gameBoardLayer.drawRay = function(x, y, radius, angle, thicknessAngle) {
    gameBoardLayer.setupDraw();
    var startAngle = angle - (thicknessAngle / 2);
    var endAngle = startAngle + thicknessAngle;

    var arcStartPoint = new Victor(x + (radius * Math.cos(startAngle)), y + (radius * Math.sin(startAngle)));
    //var arcEndPoint = new Victor(x + (radius * Math.cos(direction+(Math.PI*0.1))), y + (radius * Math.sin(direction+(Math.PI*0.1))));
    //var arcTangentPoint

    this.gameBoardBmd.ctx.moveTo(x, y);
    this.gameBoardBmd.ctx.lineTo(arcStartPoint.x, arcStartPoint.y);
    this.gameBoardBmd.ctx.arc(x, y, radius, startAngle, endAngle, false);
    this.gameBoardBmd.ctx.lineTo(x, y);
    gameBoardLayer.doDraw();
}

gameBoardLayer.setupDraw = function() {
    this.gameBoardBmd.ctx.beginPath();
    this.gameBoardBmd.ctx.fillStyle = '#0f6';
    this.gameBoardBmd.ctx.globalAlpha = 0.5;
}

gameBoardLayer.doDraw = function() {
    this.gameBoardBmd.ctx.globalAlpha = 1;
    this.gameBoardBmd.ctx.globalCompositeOperation = "destination-out";
    this.gameBoardBmd.ctx.fill();

    this.gameBoardBmd.ctx.globalAlpha = 0.5;
    this.gameBoardBmd.ctx.globalCompositeOperation = "source-over";
    this.gameBoardBmd.ctx.fill();
}