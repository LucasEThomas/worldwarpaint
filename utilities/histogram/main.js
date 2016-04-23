//gonna draw a random image here
var canvasPaint = document.getElementById("canvasPaint");
var paintCtx = canvasPaint.getContext("2d");

var canvasInput = document.getElementById("canvasInput");
var canvasOutput1 = document.getElementById("canvasOutput1");
var canvasOutput2 = document.getElementById("canvasOutput2");
var canvasOutput3 = document.getElementById("canvasOutput3");

var gl = getWebGLContext(canvasOutput1, {
    preserveDrawingBuffer: true,
    premultipliedAlpha: false
});

var interval = {};

var colorsDict = {
    blue: '#4186EF',
    teal: '#57C5B8',
    white: '#ECE0F2',
    yellow: '#ECC82F',
    orange: '#F28B31',
    red: '#EB4D4D',
    magenta: '#EC53AC',
    violet: '#9950B4'
};
var colorsArray = Object.keys(colorsDict).map((key) => colorsDict[key]);

function startGameLoop() {
    //initializeShaders();

    for (var i = 0; i < 1000; i++) {
        var color = colorsArray[Math.round(Math.random() * 7)];
        var circleX = Math.round(Math.random() * 2047);
        var circleY = Math.round(Math.random() * 2047);
        paintCtx.beginPath();
        paintCtx.fillStyle = color;
        paintCtx.moveTo(circleX, circleY)
        paintCtx.arc(circleX, circleY, 60, 0, Math.PI * 2, false);
        paintCtx.fill();
    }
}

function initializeShaders() {

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
    gl.viewport(0, 0, canvasDest.width, canvasDest.height); //set the viewport to the whole display

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    // lookup uniforms
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    vxDrawFromBufferLocation = gl.getUniformLocation(program, "u_vxDrawFromBuffer");
    fgDrawFromBufferLocation = gl.getUniformLocation(program, "u_fgDrawFromBuffer");

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
    texDest1 = setupTexture(canvasDest, 1, program, "u_canvasDest1");
    texDest2 = setupTexture(canvasDest, 2, program, "u_canvasDest1");
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

function paintCanvas(x, y, width, height) {
    //load in the buffer canvas data
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texBuff);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(bufferCtx.getImageData(x, y, width, height).data));

    //tell the shader the size to update
    setRectangle(gl, x, y, width, height);

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

}

// Counts the pixels of each player's color (taking alpha into account)
function countPixels() {
    var gl = gameBoardLayer.gameBoardDestination.gl;
    //load in the buffer canvas data
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texBuff);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, game.world.width, game.world.height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(gameBoardLayer.gameBoardBuffer.ctx.getImageData(0, 0, game.world.width, game.world.height).data));

    //tell the shader the size to update
    gameBoardLayer.gameBoardDestination.setRectangle(gl, 0, 0, game.world.width / 4, game.world.height / 4);

    //setup uniforms for combining buffer with destination data
    gl.uniform1f(gl.getUniformLocation(program, "u_flipY"), 1); //flip the y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //todo use this instead
    gl.uniform2iv(gl.getUniformLocation(program, "u_resolutionIn"), [game.world.width, game.world.height]);
    gl.uniform1i(gl.getUniformLocation(program, "u_initialInput"), 1); //initial input
    var playerClrs = [
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 1.0, 0.0
        ];
    gl.uniform3fv(gl.getUniformLocation(program, "u_initialInput"), playerClrs); //players colors array

    //tell it to write from inputTex
    gl.uniform1i(gl.getUniformLocation(program, "u_textureIn"), 0);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texDest1);
    //into framebuffer1
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    var atlasRects = [
        {
            x: 0,
            y: 0,
            w: 512,
            h: 512
        },
        {
            x: 0,
            y: 0,
            w: 128,
            h: 128
        },
        {
            x: 512,
            y: 0,
            w: 32,
            h: 32
        },
        {
            x: 128,
            y: 0,
            w: 8,
            h: 8
        },
        {
            x: 512,
            y: 32,
            w: 2,
            h: 2
        }
    ];

    for (var i = 0; i < 5; i++) {
        //todo, need to tell it the destination location in the atlas
        gameBoardLayer.gameBoardDestination.setRectangle(gl, atlasRects[i].x, atlasRects[i].y, atlasRects[i].w, atlasRects[i].h);

        //set the location of the previous atlas, todo, need to set position and resolution here.
        gl.uniform1i(gl.getUniformLocation(program, "u_textureIn"), i % 2 ? 1 : 2);
        gl.activeTexture(gl.TEXTURE0 + i % 2 ? 1 : 2);
        gl.bindTexture(gl.TEXTURE_2D, i % 2 ? texAtlas1 : texAtlas2);
        //into framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, i % 2 ? fbo2 : fbo1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    var pixels = new Uint8Array(16);
    gl.readPixels(x, y, 4, 4, gl.RGBA, gl.UNSIGNED_BYTE, pixels); //todo, need to set to the final 4x4 atlas
    //scores is an array that will hold the amount of paint each player has
    var scores = new Uint8Array(4);
    for (var i = 0; i < 16; i++) {
        scores[i % 4] += pixels[i];
    }
    console.log(scores); //for now, just output to the console.
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

class LocationsCache {
    constructor(gl, program, strings) {
        this.gl = gl;
        this.program = program;
        this.map = {};

        strings.forEach((string, index) => {
            this.setLocation(string);
        });
    }
    setLocation(string) {
        if (string.substring(0, 2).toLowerCase() === 'u_') {
            this.setUniformLocation(string);

        } else if (string.substring(0, 2).toLowerCase() === 'a_') {
            this.setAttributeLocation(string);
        } else {
            console.error('string must begin with \'u_\' or \'a_\'');
        }

    }
    setUniformLocation(string) {
        this.map[string] = this.gl.getUniformLocation(this.program, string);
        if (!this.map[string] === -1) {
            console.error('a uniform with the name ' + string + ' was not found in the shader program');
        }
    }
    setAttributeLocation(string) {
        this.map[string] = this.gl.getAttribLocation(this.program, string);
        if (!this.map[string] === -1) {
            console.error('an attribute with the name ' + string + ' was not found in the shader program');
        }
    }
    getLoc(string) {
        return this.map[string];
    }
}

startGameLoop();