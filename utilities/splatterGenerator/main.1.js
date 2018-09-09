var sourceCanvas = document.getElementById("canvas");
var animationCanvas = document.getElementById("animationCanvas");
var ctx = canvas.getContext("2d");

function drawSplatters() {
    ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);

    for(let y = 64; y < 1024; y+= 128){
        frames = generateAnimatedBlobControlPoints(48,0.5,30,8)

        frames.forEach( (controlPoints, n) =>{
            drawSplatterWithControlPoints(64 + n * 128, y, 56, controlPoints);
        })
    }

    
}

function drawSplatterWithControlPoints(x, y, radius, controlPoints) {
    var tension = radius * 0.1;
    
    //var controlPoints = generateBlobControlPoints(x, y, radius, 32);

    ctx.beginPath();
    ctx.fillStyle = "#00ff88";
    ctx.moveTo(x, y);
    
    ctx.moveTo(controlPoints[0].x + x, controlPoints[0].y + y);

    for (var i = 0; i <= controlPoints.length - 1; i++) {
        var point = controlPoints[i];
        var prevPoint = controlPoints[(i > 0) ? i - 1 : controlPoints.length - 1];
        var nextPoint = controlPoints[(i + 1) % controlPoints.length];
        var nextnextPoint = controlPoints[(i + 2) % controlPoints.length];

        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);

        ctx.bezierCurveTo(cp1.x + x, cp1.y + y, cp2.x + x, cp2.y + y, nextPoint.x + x, nextPoint.y + y);
    }
    
    ctx.fill();
}

// Imagine a circle but with variable radius as you change the angle. That's a blob. We're making an animated one here.
function generateAnimatedBlobControlPoints(startRadius, noiseMagnitude, vertexCount, framesCount){

    // create an array of factors to grow/shrink the vertex point (radius) each frame
    let scaleFactors = Array(vertexCount).fill(undefined)
        .map(() => Math.getRandomArbitrary(-noiseMagnitude, noiseMagnitude) / framesCount) 

    // now create an array of frames, where the first frame has uniform radii, but each subsequent frame's radii are increasingly distorted
    let interpolatedRadii = Array(framesCount).fill(scaleFactors)
        .map((scaleFactors,nFrame) => scaleFactors.map((factor) => startRadius + nFrame * factor * startRadius)) // an array of "frames". Each frame is an array of radii

    return frames = interpolatedRadii
        .map( frame => frame.map((radius, nRadius) => {
                let angle = Math.TWOPI * nRadius / vertexCount;
                return new Victor(  Math.round(radius * Math.cos(angle)), 
                                    Math.round(radius * Math.sin(angle)) )
        }))
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

//grab the context from your destination canvas
var destCtx = animationCanvas.getContext('2d');


let frameCounter = 0;
let blobCounter = 0;

let animationInterval

function animate(){
    animationInterval = setInterval( ()=>{
        //call its drawImage() function passing it the source canvas directly
        destCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height)
        destCtx.drawImage(sourceCanvas, -frameCounter*128, -blobCounter*128)
        frameCounter = (frameCounter + 1) % 8
        if(frameCounter == 7){
            blobCounter = (blobCounter + 1) % 8
            clearInterval(animationInterval)
            setTimeout(()=>animate(),1000)
        }
    }, 32)
}

animate()
