var canvasBuff = document.getElementById("canvasBuffer");
var canvasDest = document.getElementById("canvasDest");
var bufferCtx = canvasBuff.getContext("2d");
var gl = getWebGLContext(canvasDest);

var interval = {};
function startGameLoop(){
	initializeShaders();
	interval = setInterval(() => {
            circleX = Math.random()*127;
            circleY = Math.random()*127;
            bufferCtx.clearRect(0,0,canvasBuff.width,canvasBuff.height);
            bufferCtx.beginPath();
            bufferCtx.fillStyle = "red";
            bufferCtx.moveTo(circleX, circleY)
            bufferCtx.arc(circleY, circleX, 3, 0, Math.PI * 2, false);
            bufferCtx.fill();
            paintCanvas(0,0,canvasBuff.width,canvasBuff.height);
        }, 500);
}

function initializeShaders(){

    // Get A WebGL context
    if (!gl) {
        console.error('no gl')
        return;
    }

    // setup GLSL program
    vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // lookup uniforms
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // set the resolution
    gl.uniform2f(resolutionLocation, canvasDest.width, canvasDest.height);

    // Create a buffer for the position of the rectangle corners.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, canvasDest.width, canvasDest.height);

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
    texBuff = setupTexture(canvasBuff, 0, program, "u_canvasBuff");
    texDest1 = setupTexture(canvasDest, 1, program, "u_canvasDest");
    texDest2 = setupTexture(canvasDest, 2, program, "u_canvasDest");
    
    // Create a framebuffer and attach texDest1 to it
    fbo1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texDest1, 0);
    
    // Create a framebuffer and attach texDest2 to it
    fbo2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texDest2, 0);
    
    //gl.preserveDrawingBuffer = true;
}
var resolutionLocation;
var texBuff;
var texDest1;
var texDest2;
var fbo1;
var fbo2;

var toggle = true;
function paintCanvas(x,y,width,height) {
    //load in the buffer canvas data
    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(bufferCtx.getImageData(x,y,width,height).data));
    
    gl.activeTexture(gl.TEXTURE0 + (toggle?2:1));
    gl.bindTexture(gl.TEXTURE_2D, toggle?texDest2:texDest1);
    //ping pong between framebuffers rendering each successive result as an aggregate composite of the previous ones
    if(toggle){
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);           //set the framebuffer we're rendering into (output)
        gl.uniform2f(resolutionLocation, width, height);    //Tell the shader the resolution of the framebuffer.
        gl.viewport(0, 0, width, height);                   //Tell webgl the viewport setting needed for framebuffer.
        gl.drawArrays(gl.TRIANGLES, 0, 6);                  //do the draw
    } else{
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);           //set the framebuffer we're rendering into (output)
        gl.uniform2f(resolutionLocation, width, height);    //Tell the shader the resolution of the framebuffer.
        gl.viewport(0, 0, width, height);                   //Tell webgl the viewport setting needed for framebuffer.
        gl.drawArrays(gl.TRIANGLES, 0, 6);                  //do the draw
    }
    
    //render the result to the screen
    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), -1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 6); 
    
    //set the next texture (input)
    gl.bindTexture(gl.TEXTURE_2D, toggle?texDest1:texDest2);
    toggle = !toggle;
}

function setRectangle(gl, x, y, width, height) {
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

startGameLoop();
