var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function drawSplatters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for(var x = 0; x<1024; x+=128){
        for(var y = 0; y<640; y+=128){
            drawRandomSplatter(x+64,y+64,56);
        }
    }
    for(var x = 0; x<1024; x+=64){
        for(var y = 640; y<896; y+=64){
            drawRandomSplatter(x+32,y+32,29);
        }
    }
    for(var x = 0; x<1024; x+=32){
        for(var y = 896; y<1024; y+=32){
            drawRandomSplatter(x+16,y+16,14);
        }
    }

}

function drawRandomSplatter(x, y, radius) {
    var tension = radius * 0.1;
    var controlPoints = generateBlobControlPoints(x, y, radius, 32);

    ctx.beginPath();
    ctx.fillStyle = "#00ff88";
    ctx.moveTo(x, y);
    
    ctx.moveTo(controlPoints[0].x, controlPoints[0].y);

    for (var i = 0; i <= controlPoints.length - 1; i++) {
        var point = controlPoints[i];
        var prevPoint = controlPoints[(i > 0) ? i - 1 : controlPoints.length - 1];
        var nextPoint = controlPoints[(i + 1) % controlPoints.length];
        var nextnextPoint = controlPoints[(i + 2) % controlPoints.length];

        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);

        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, nextPoint.x, nextPoint.y);
    }
    
    ctx.fill();
}
function generateBlobControlPoints(x, y, radius, count) {
    var toReturn = [];
    for (var i = 0; i < count; i++) {
        var angle = Math.TWOPI * i / count;
        var randomRadius = radius + radius * Math.getRandomArbitrary(-0.1, 0.1);
        toReturn.push(new Victor(Math.round(x + (randomRadius * Math.cos(angle))), Math.round(y + (randomRadius * Math.sin(angle)))))
    }
    return toReturn;
}

function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

document.getElementById('download').addEventListener('click', function() {
    downloadCanvas(this, 'canvas', 'splatters.png');
}, false);

Math.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
}

Math.TWOPI = Math.PI * 2;

drawSplatters();
