paintGround = function (){
    
}

//just draws a heart for now
paintGround.drawSplotch = function (x, y) {
    
    bmdGameBoardLayer.ctx.strokeStyle = '#f0f';
    bmdGameBoardLayer.ctx.lineWidth = 10;
    // Quadratric curves example
    bmdGameBoardLayer.ctx.beginPath();

    bmdGameBoardLayer.ctx.moveTo(x+75, y+25);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+25, y+25, x+25, y+62.5);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+25, y+100, x+50, y+100);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+50, y+120, x+30, y+125);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+60, y+120, x+65, y+100);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+125, y+100, x+125, y+62.5);
    bmdGameBoardLayer.ctx.quadraticCurveTo(x+125, y+25, x+75, y+25);
    bmdGameBoardLayer.ctx.stroke();
  }