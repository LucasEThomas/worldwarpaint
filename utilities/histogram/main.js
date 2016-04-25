'use strict'
//gonna draw a random image on this canvas
var canvasPaint = document.getElementById("canvasPaint");
var paintCtx = canvasPaint.getContext("2d");

//the initial paint canvas
var canvasInput = document.getElementById("canvasGl");

//then output to these ones. (maybe?)

var gl = getWebGLContext(canvasGl, {
    preserveDrawingBuffer: true,
    premultipliedAlpha: false
});

var interval = {};

var hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

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
//console.log(colorsArray);
//var colorsRGBArray = colorsArray
//    .map((clr) => hexToRgb(clr))
//    .map((clr) => [Math.round(clr.r/25.5)*0.1, Math.round(clr.g/25.5)*0.1, Math.round(clr.b/25.5)*0.1])
//    .reduce((flat,toFlatten) => flat.concat(toFlatten))
//    .map((component)=>(component + '').substr(0,3))
//    .reduce((flat,toFlatten) => flat.concat(toFlatten + ', '));
//console.log(colorsRGBArray);



function start() {
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
    initializeShaders();
    countPixels();
}

var gl;
var program;
var locCache;
function initializeShaders() {

    // Get A WebGL context
    if (!gl) {
        console.error('no gl')
        return;
    }

    // setup GLSL program
    var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    var histogramShader = createShaderFromScriptElement(gl, "histogram-fragment-shader");
    program = createProgram(gl, [vertexShader, histogramShader]);
    gl.useProgram(program);
    gl.viewport(0, 0, canvasGl.width, canvasGl.height); //set the viewport to the whole display

    // look up where the vertex data needs to go.
    locCache = new LocationsCache(gl, program, ['a_position', 'u_resolutionOut', 'u_vxDrawFromBuffer', 'u_fgDrawFromBuffer', 'u_flipY', 'u_resolutionIn', 'u_canvasDest', 'u_initialInput', 'u_textureIn']);

    // set the resolution
    gl.uniform2f(locCache.getLoc('u_resolutionIn'), canvasGl.width, canvasGl.height);

    // Create a buffer for the position of the rectangle corners.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(locCache.getLoc('a_position'));
    gl.vertexAttribPointer(locCache.getLoc('a_position'), 2, gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, canvasGl.width, canvasGl.height);

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
    texInput = setupTexture(canvasGl, 0, program, 'u_textureIn');
    texAtlas1 = setupTexture(canvasGl, 1, program, 'u_textureIn');
    texAtlas2 = setupTexture(canvasGl, 2, program, 'u_textureIn');

    // Create a framebuffer and attach texAtlas1 to it
    fbo1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texAtlas1, 0);

    // Create a framebuffer and attach texAtlas2 to it
    fbo2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texAtlas2, 0);
}

var texInput;
var texAtlas1;
var texAtlas2;
var fbo1;
var fbo2;

// Counts the pixels of each player's color (taking alpha into account)
function countPixels() {
    //load the paint canvas data into inputTex
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texInput);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2048, 2048, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(paintCtx.getImageData(0, 0, 2048, 2048).data));

    //tell the shader the size to update
    setRectangle(gl, 0, 0, 2048 / 4, 2048 / 4);

    //setup uniforms for combining buffer with destination data
    gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //todo use this instead
    gl.uniform2fv(locCache.getLoc('u_resolutionIn'), [2048, 2048]);
    gl.uniform1i(locCache.getLoc('u_initialInput'), 1); //initial input
    var playerClrs = 
        [
            0.3, 0.5, 0.9, 
            0.3, 0.8, 0.7, 
            0.9, 0.9, 0.9, 
            0.9, 0.8, 0.2, 
            0.9, 0.5, 0.2, 
            0.9, 0.3, 0.3, 
            0.9, 0.3, 0.7, 
            0.6, 0.3, 0.7
        ];
    gl.uniform3fv(locCache.getLoc('u_initialInput'), playerClrs); //players colors array

    //tell it to write from inputTex
    gl.uniform1i(locCache.getLoc('u_textureIn'), 0);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texInput);
    //into framebuffer1
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    var atlasRects = [
        null,
        {
            x: 0,
            y: 0,
            w: 2048,
            h: 2048
        },
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

    for (var i = 2; i < 7; i++) {
        //todo, need to tell it the destination location in the atlas
        setRectangle(gl, atlasRects[i].x, atlasRects[i].y, atlasRects[i].w, atlasRects[i].h);
        gl.uniform2fv(locCache.getLoc('u_resolutionIn'), [atlasRects[i-1].w, atlasRects[i-1].h]);
        gl.uniform2fv(locCache.getLoc('u_resolutionOut'), [atlasRects[i].w, atlasRects[i].h]); //initial input

        //set the location of the previous atlas, todo, need to set position and resolution here.
        gl.uniform1i(locCache.getLoc('u_textureIn'), i % 2 ? 1 : 2);
        gl.activeTexture(gl.TEXTURE0 + (i % 2 ? 1 : 2));
        gl.bindTexture(gl.TEXTURE_2D, i % 2 ? texAtlas1 : texAtlas2);
        //into framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, i % 2 ? fbo2 : fbo1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    var pixels = new Uint8Array(16);
    gl.readPixels(512, 32, 4, 4, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
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

start();