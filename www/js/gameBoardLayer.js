gameBoardLayer = function (){
    
}

gameBoardLayer.initialize = function (){
    this.gameBoardBmd = game.add.bitmapData(game.world.width, game.world.height);
    
    //add it as a sprite object to the actual game so that we can see it.
    gameBoardLayerSprite = game.add.sprite(0, 0, this.gameBoardBmd);
    
    gameBoardLayerSprite.inputEnabled = true;
    gameBoardLayerSprite.events.onInputUp.add(gameBoardLayer.mouseUp);
}

gameBoardLayer.mouseUp = function(){
    //logic for placing towers goes here?
    gameBoardLayer.drawBlob(game.input.worldX, game.input.worldY, 50);
}

gameBoardLayer.gameBoardBmd; //The game board layer. This is the semi-transparent layer where the players' paint colors are drawn.

gameBoardLayer.drawBlob = function (x, y, radius){
    var tension = radius*0.1;
    var controlPoints = gameBoardLayer.generateBlobControlPoints(x,y,radius,32);
    
    this.gameBoardBmd.ctx.beginPath();
    this.gameBoardBmd.ctx.fillStyle = '#0f6';
    this.gameBoardBmd.ctx.globalAlpha = 0.5;
    this.gameBoardBmd.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
    
    for (var i = 0; i <= controlPoints.length - 1; i++){
        var point = controlPoints[i];
        var prevPoint = controlPoints[(i>0)?i-1:controlPoints.length-1];
        var nextPoint = controlPoints[(i+1)%controlPoints.length];
        var nextnextPoint = controlPoints[(i+2)%controlPoints.length];
        
        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);
        
        this.gameBoardBmd.ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,nextPoint.x,nextPoint.y);
    }
    this.gameBoardBmd.ctx.fill();
    
    //gameBoardLayer.debugControlPoints(controlPoints, tension);
}

gameBoardLayer.generateBlobControlPoints = function(x, y, radius,count){
    var toReturn = [];
    for(var i = 0; i < count; i++){
        var angle = 2 * Math.PI * i / count;
        var randomRadius = radius + radius * Math.getRandomArbitrary(-0.5,0.5);
        toReturn.push(new Victor(Math.round(x + (randomRadius * Math.cos(angle))), Math.round(y + (randomRadius * Math.sin(angle)))))
    }
    return toReturn;
}

Math.getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}