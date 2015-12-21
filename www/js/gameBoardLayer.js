gameBoardLayer = function (){
    
}

gameBoardLayer.initialize = function (){
    this.gameBoardBmd = game.add.bitmapData(game.world.width, game.world.height);
    
    //add it as a sprite object to the actual game so that we can see it.
    game.add.sprite(0, 0, this.gameBoardBmd);
}

gameBoardLayer.gameBoardBmd; //The game board layer. This is the semi-transparent layer where the players' paint colors are drawn.

//just draws a heart for now
gameBoardLayer.drawSplotch = function (x, y) {
    
    this.gameBoardBmd.ctx.strokeStyle = '#f0f';
    this.gameBoardBmd.ctx.lineWidth = 10;
    // Quadratric curves example
    this.gameBoardBmd.ctx.beginPath();
    this.gameBoardBmd.ctx.moveTo(x+75, y+25);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+25, y+25, x+25, y+62.5);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+25, y+100, x+50, y+100);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+50, y+120, x+30, y+125);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+60, y+120, x+65, y+100);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+125, y+100, x+125, y+62.5);
    this.gameBoardBmd.ctx.quadraticCurveTo(x+125, y+25, x+75, y+25);
    //this.gameBoardBmd.ctx.be
    this.gameBoardBmd.ctx.stroke();
  }


gameBoardLayer.drawCircles = function (x, y, radius){
    this.gameBoardBmd.ctx.beginPath();
    this.gameBoardBmd.ctx.fillStyle = '#0ff';
    var controlPoints = this.generateBlobControlPoints(x,y,radius,32);
    for (var i = 0; i < controlPoints.length; i++){
        this.gameBoardBmd.ctx.moveTo(controlPoints[i].x, controlPoints[i].y);
        this.gameBoardBmd.ctx.ellipse(controlPoints[i].x,controlPoints[i].y,5,5,0,0,360,false);
    }
    this.gameBoardBmd.ctx.fill();
}

gameBoardLayer.drawBlob = function (x, y, radius){
    var tension = 20;
    var controlPoints = this.generateBlobControlPoints(x,y,radius,32);
    
    this.gameBoardBmd.ctx.beginPath();
    this.gameBoardBmd.ctx.lineWidth = 2
    this.gameBoardBmd.ctx.fillStyle = '#0f4';
    this.gameBoardBmd.ctx.fillStyle = '#0f0';
    this.gameBoardBmd.ctx.globalAlpha = 0.6;
    
    for (var i = 0; i <= controlPoints.length; i++){
        var n = i % controlPoints.length;
        var point = controlPoints[n];
        var prevPoint = controlPoints[(n>0)?n-1:controlPoints.length-1];
        var nextPoint = controlPoints[(n+1)%controlPoints.length];
        var nextnextPoint = controlPoints[(n+2)%controlPoints.length];
        
        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);
        
        
        
        this.gameBoardBmd.ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,nextPoint.x,nextPoint.y);
        //this.gameBoardBmd.ctx.lineTo(point.x,point.y);
    }
    this.gameBoardBmd.ctx.fill();
    this.gameBoardBmd.ctx.stroke();
    
//    this.gameBoardBmd.ctx.globalAlpha = 1;
//    for (var i = 0; i <= controlPoints.length; i++){
//        var n = i % controlPoints.length;
//        
//        var point = controlPoints[n];
//        var prevPoint = controlPoints[(n>0)?n-1:controlPoints.length-1];
//        var nextPoint = controlPoints[(n+1)%controlPoints.length];
//        var nextnextPoint = controlPoints[(n+2)%controlPoints.length];
//        
//        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
//        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
//        var cp1 = nextPoint.clone().add(nextTangent);
//        var cp2 = point.clone().subtract(tangent);
//        
//        
//        this.gameBoardBmd.ctx.moveTo(point.x, point.y);
//        //this.gameBoardBmd.ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
//        this.gameBoardBmd.ctx.beginPath();
//        this.gameBoardBmd.ctx.fillStyle = '#f' + i + '' + i;
//        this.gameBoardBmd.ctx.ellipse(cp1.x,cp1.y,3,3,0,0,360,false);
//        this.gameBoardBmd.ctx.fill();
//        
//        this.gameBoardBmd.ctx.beginPath();
//        this.gameBoardBmd.ctx.fillStyle = '#' + i + '' + i + 'f';
//        this.gameBoardBmd.ctx.ellipse(cp2.x,cp2.y,3,3,0,0,360,false);
//        this.gameBoardBmd.ctx.fill();
//        
//        this.gameBoardBmd.ctx.beginPath();
//        this.gameBoardBmd.ctx.fillStyle = '#0ff';
//        this.gameBoardBmd.ctx.ellipse(point.x,point.y,5,5,0,0,360,false);
//        this.gameBoardBmd.ctx.fill();
//        
//    }
}

gameBoardLayer.generateBlobControlPoints = function(x, y, radius,count){
    var toReturn = [];
    for(var i = 0; i < count; i++){
        var angle = 2 * Math.PI * i / count;
        var randomRadius = radius + radius * this.getRandomArbitrary(-0.5,0.5);
        toReturn.push(new Victor(Math.round(x + (randomRadius * Math.cos(angle))), Math.round(y + (randomRadius * Math.sin(angle)))))
    }
    return toReturn;
}

gameBoardLayer.getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}

//smoothBezierPath(points, smoothingScale){
//    var controlPointsToReturn;
//    for(int i = 0; i < points.length; i++){
//        p0=points[i>1:i-1?points.length-1];
//        p1=points[i];
//        p2=points[i<points.length];
//        tangent = {
//            x:
//            y:
//        }(p2 – p0).normalized;
//        
//        q0 = p1 - smoothingScale * tangent;
//        q1 = p1 + smoothingScale * tangent;
//        
//        controlPointsToReturn.add({
//            x:points[i].x,
//            y:points[i].y,
//            c1:
//            c2:
//        });
//    }
//}