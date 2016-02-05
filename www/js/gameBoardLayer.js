gameBoardLayer = function() {

}
//gameBoardLayer.baseTexture;
gameBoardLayer.initialize = function() {
    gameBoardLayer.gameBoardBuffer = game.add.bitmapData(game.world.width, game.world.height);

    //add it as a sprite object to the actual game so that we can see it.
    //gameBoardLayerSprite = game.add.sprite(0, 0, this.gameBoardBuffer);

    //gameBoardLayerSprite.inputEnabled = true;
    //gameBoardLayerSprite.events.onInputUp.add(gameBoardLayer.mouseUp);
    
    
    var canvas = document.getElementById('gameboard_canvas');
    var context = canvas.getContext('2d');
    gameBoardLayer.baseTexture = new PIXI.BaseTexture(canvas);
    var texture = new PIXI.Texture(gameBoardLayer.baseTexture);
    var textureFrame = new Phaser.Frame(0, 0, 0, game.world.width, game.world.height, 'debug', game.rnd.uuid());
    sprite = game.add.sprite(0, 0, texture, textureFrame);
    sprite.fixedToCamera = false;
}

gameBoardLayer.mouseUp = function() {
    //logic for placing towers goes here?
    if (towerDrag) {
        if (gameBoardLayer.colorMatch(game.input.worldX, game.input.worldY, player.clr)) {
            tower.towerPlaced();
        }
    } else {
        gameBoardLayer.drawRandomBlob(game.input.worldX - 100, game.input.worldY, 50);
        gameBoardLayer.drawRandomSprinkles(game.input.worldX + 100, game.input.worldY, 50, 20);
        gameBoardLayer.drawRay(game.input.worldX, game.input.worldY, 200, Math.random() * Math.TWOPI, Math.TWOPI * 0.025);
    }
}

gameBoardLayer.gameBoardBuffer; //The game board layer. This is the semi-transparent layer where the players' paint colors are drawn.

gameBoardLayer.colorMatch = function(x, y, rgb) {
    var placeRGB = gameBoardLayer.gameBoardBuffer.ctx.getImageData(x, y, 1, 1).data;
    return (Math.abs(placeRGB[0] - rgb.r) <= 12 && Math.abs(placeRGB[1] - rgb.g) <= 12 && Math.abs(placeRGB[2] - rgb.b) <= 12);
}

gameBoardLayer.drawRandomBlob = function(x, y, radius, playerClr) {
    var tension = radius * 0.1;
    var controlPoints = gameBoardLayer.generateBlobControlPoints(x, y, radius, 32);

    gameBoardLayer.setupDraw(playerClr);
    this.gameBoardBuffer.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);

    for (var i = 0; i <= controlPoints.length - 1; i++) {
        var point = controlPoints[i];
        var prevPoint = controlPoints[(i > 0) ? i - 1 : controlPoints.length - 1];
        var nextPoint = controlPoints[(i + 1) % controlPoints.length];
        var nextnextPoint = controlPoints[(i + 2) % controlPoints.length];

        var tangent = nextPoint.clone().subtract(prevPoint).normalize().multiplyScalar(tension);
        var nextTangent = nextnextPoint.clone().subtract(point).normalize().multiplyScalar(tension);
        var cp1 = point.clone().add(tangent);
        var cp2 = nextPoint.clone().subtract(nextTangent);

        this.gameBoardBuffer.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, nextPoint.x, nextPoint.y);
    }
    gameBoardLayer.doDraw(Math.round(x-(1.5*radius)),Math.round(y-(1.5*radius)),Math.round((1.5*radius)*2),Math.round((1.5*radius)*2));
}
gameBoardLayer.generateBlobControlPoints = function(x, y, radius, count) {
    var toReturn = [];
    for (var i = 0; i < count; i++) {
        var angle = Math.TWOPI * i / count;
        var randomRadius = radius + radius * Math.getRandomArbitrary(-0.1, 0.1);
        toReturn.push(new Victor(Math.round(x + (randomRadius * Math.cos(angle))), Math.round(y + (randomRadius * Math.sin(angle)))))
    }
    return toReturn;
}

gameBoardLayer.drawRandomSprinkles = function(x, y, radius, count) {
    gameBoardLayer.setupDraw();
    for (var i = 0; i < count; i++) {
        var currentRadius = radius * Math.random();
        var currentDirection = Math.TWOPI * Math.random();
        var currentX = x + (currentRadius * Math.cos(currentDirection));
        var currentY = y + (currentRadius * Math.sin(currentDirection));
        gameBoardLayer.gameBoardBuffer.ctx.moveTo(currentX, currentY);
        gameBoardLayer.gameBoardBuffer.ctx.arc(currentX, currentY, 3, 0, Math.TWOPI, false);
    }
    gameBoardLayer.doDraw();
}

gameBoardLayer.drawSprinkle = function(x, y, radius, playerClr) {
    gameBoardLayer.setupDraw(playerClr);
    gameBoardLayer.gameBoardBuffer.ctx.moveTo(x, y);
    gameBoardLayer.gameBoardBuffer.ctx.arc(x, y, radius, 0, Math.TWOPI, false);
    gameBoardLayer.doDraw(x-radius,y-radius,radius*2,radius*2);
}

gameBoardLayer.drawRay = function(x, y, radius, angle, thicknessAngle) {
    gameBoardLayer.setupDraw();
    var startAngle = angle - (thicknessAngle / 2);
    var endAngle = startAngle + thicknessAngle;

    var arcStartPoint = new Victor(x + (radius * Math.cos(startAngle)), y + (radius * Math.sin(startAngle)));

    this.gameBoardBuffer.ctx.moveTo(x, y);
    this.gameBoardBuffer.ctx.lineTo(arcStartPoint.x, arcStartPoint.y);
    this.gameBoardBuffer.ctx.arc(x, y, radius, startAngle, endAngle, false);
    this.gameBoardBuffer.ctx.lineTo(x, y);
    gameBoardLayer.doDraw();//todo, compute bounding rect for this guy
}

gameBoardLayer.setupDraw = function(playerClr) {
    gameBoardLayer.gameBoardBuffer.ctx.beginPath();
    gameBoardLayer.gameBoardBuffer.ctx.fillStyle = Utility.rgbToHex(playerClr.r, playerClr.g, playerClr.b);
}

gameBoardLayer.doDraw = function(x,y,width,height) {
    gameBoardLayer.gameBoardBuffer.ctx.fill();
    gameBoardLayer.gameBoardDestination.paint(x,y,width,height);
    gameBoardLayer.gameBoardBuffer.ctx.clearRect(x,y,width,height);
}

gameBoardLayer.gameBoardDestination = function() {

}

gameBoardLayer.gameBoardDestination.initialize = function(canvas) {
    gameBoardLayer.gameBoardDestination.gl = getWebGLContext(canvas, {preserveDrawingBuffer: true, premultipliedAlpha: false});
    var gl = gameBoardLayer.gameBoardDestination.gl
    // Get A WebGL context
    if (!gl) {
        console.error('no gl')
        return;
    }

    // setup GLSL program
    vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    //histogramShader = createShaderFromScriptElement(gl, "histogram-fragment-shader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    //histogramProgram = createProgram(gl, [vertexShader, histogramShader]);
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height); //set the viewport to the whole display

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    // lookup uniforms
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    vxDrawFromBufferLocation = gl.getUniformLocation(program, "u_vxDrawFromBuffer");
    fgDrawFromBufferLocation = gl.getUniformLocation(program, "u_fgDrawFromBuffer");

    // set the resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Create a buffer for the position of the rectangle corners.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    gameBoardLayer.gameBoardDestination.setRectangle(gl, 0, 0, canvas.width, canvas.height);

    function setupTexture(canvas, textureUnit, program, uniformName) {
        var tex = gl.createTexture();

        //update Texture From Canvas
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        var location = gl.getUniformLocation(program, uniformName);
        gl.uniform1i(location, textureUnit);
        return tex;
    }

    //setup the textures
    texBuff = setupTexture(canvas, 0, program, "u_canvasBuff");
    texDest1 = setupTexture(canvas, 1, program, "asdf");
    texDest2 = setupTexture(canvas, 2, program, "asdf");
    u_canvasDestLocation = gl.getUniformLocation(program, "u_canvasDest");

    // Create a framebuffer and attach texDest1 to it
    fbo1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texDest1, 0);

    // Create a framebuffer and attach texDest2 to it
    fbo2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texDest2, 0);
}
var resolutionLocation;
var u_canvasDestLocation;
var vxDrawFromBufferLocation;
var fgDrawFromBufferLocation;
var texBuff;
var texDest1;
var texDest2;
var fbo1;
var fbo2;

//gameBoardLayer.gameBoardDestination.render = function(){
//    drawScene();
//}

gameBoardLayer.gameBoardDestination.paint = function(x, y, width, height){
    var gl = gameBoardLayer.gameBoardDestination.gl;
    //load in the buffer canvas data
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texBuff);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(gameBoardLayer.gameBoardBuffer.ctx.getImageData(x, y, width, height).data));
    
    //tell the shader the size to update
    gameBoardLayer.gameBoardDestination.setRectangle(gl, x, y, width, height);

    //setup uniforms for combining buffer with destination data
    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), 1); //flip the y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //todo use this instead
    gl.uniform1f(vxDrawFromBufferLocation, 1); //combine buffer and destination data
    gl.uniform1f(fgDrawFromBufferLocation, 1); //combine buffer and destination data

    //tell it to write from texDest1
    gl.uniform1i(u_canvasDestLocation, 1);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, texDest1);
    //into framebuffer2
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    //now copy result back to to prev texDest1
    gl.uniform1f(vxDrawFromBufferLocation, 0); //render only the destination texture to the screen
    gl.uniform1f(fgDrawFromBufferLocation, 0); //render only the destination texture to the screen
    gl.uniform1i(u_canvasDestLocation, 2);
    gl.activeTexture(gl.TEXTURE0 + 2);
    gl.bindTexture(gl.TEXTURE_2D, texDest2); //bind the last destination texture as the input to this draw
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1); //set the framebuffer we're rendering into (output)
    gl.drawArrays(gl.TRIANGLES, 0, 6); //do the draw
    
    //render the result to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); //now, render to the screen not a framebuffer
    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), -1); //don't flip the y axis for this operation
    gl.drawArrays(gl.TRIANGLES, 0, 6); //do the draw
    
    //PIXI.updateWebGLTexture(gameBoardLayer.baseTexture, game.renderer.gl);
}

gameBoardLayer.gameBoardDestination.setRectangle = function(gl, x, y, width, height){
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}

// Counts the pixels of each player's color (taking alpha into account)
//gameBoardLayer.countPixels = function(){
//    var gl = gameBoardLayer.gameBoardDestination.gl;
//    //load in the buffer canvas data
//    gl.activeTexture(gl.TEXTURE0);
//    gl.bindTexture(gl.TEXTURE_2D, texBuff);
//    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, game.world.width, game.world.height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(gameBoardLayer.gameBoardBuffer.ctx.getImageData(0, 0, game.world.width, game.world.height).data));
//    
//    //tell the shader the size to update
//    gameBoardLayer.gameBoardDestination.setRectangle(gl, 0, 0, game.world.width/4, game.world.height/4);
//
//    //setup uniforms for combining buffer with destination data
//    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), 1); //flip the y axis
//    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //todo use this instead
//    gl.uniform2iv(gl.getUniformLocation(program, "u_resolutionIn"), [game.world.width, game.world.height]);
//    gl.uniform1i(gl.getUniformLocation(program, "u_initialInput"), 1); //initial input
//    var playerClrs = [
//        1.0, 0.0, 0.0,
//        0.0, 1.0, 0.0,
//        0.0, 0.0, 1.0,
//        1.0, 1.0, 0.0
//    ];
//    gl.uniform3fv(gl.getUniformLocation(program, "u_initialInput"), playerClrs); //players colors array
//
//    //tell it to write from inputTex
//    gl.uniform1i(gl.getUniformLocation(program, "u_textureIn"), 0);
//    gl.activeTexture(gl.TEXTURE0 + 0);
//    gl.bindTexture(gl.TEXTURE_2D, texDest1);
//    //into framebuffer1
//    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
//    gl.drawArrays(gl.TRIANGLES, 0, 6);
//    
//    
//    var atlasRects = [
//        {x:0,   y:0,    w:512,  h:512},
//        {x:0,   y:0,    w:128,  h:128},
//        {x:512, y:0,    w:32,   h:32},
//        {x:128, y:0,    w:8,    h:8},
//        {x:512, y:32,   w:2,    h:2}
//    ]
//    
//    for(var i=0; i<5; i++){
//        //todo, need to tell it the destination location in the atlas
//        gameBoardLayer.gameBoardDestination.setRectangle(gl, atlasRects[i].x, atlasRects[i].y, atlasRects[i].w, atlasRects[i].h);
//        
//        //set the location of the previous atlas, todo, need to set position and resolution here.
//        gl.uniform1i(gl.getUniformLocation(program, "u_textureIn"), i%2?1:2);
//        gl.activeTexture(gl.TEXTURE0 + i%2?1:2);
//        gl.bindTexture(gl.TEXTURE_2D, i%2?texAtlas1:texAtlas2);
//        //into framebuffer1
//        gl.bindFramebuffer(gl.FRAMEBUFFER, i%2?fbo2:fbo1);
//        gl.drawArrays(gl.TRIANGLES, 0, 6);
//    }
//    var pixels = new Uint8Array(16);
//    gl.readPixels(x, y, 4, 4, gl.RGBA, gl.UNSIGNED_BYTE, pixels);//todo, need to set to the final 4x4 atlas
//    //scores is an array that will hold the amount of paint each player has
//    var scores = new Uint8Array(4);
//    for(var i=0; i<16; i++){
//        scores[i%4] += pixels[i];
//    }
//    console.log(scores);//for now, just output to the console.
//}