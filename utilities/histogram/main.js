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
//    .map((clr) => [clr.r/255, clr.g/255, clr.b/255])
//    //.map((clr) => [Math.round(clr.r/25.5)*0.1, Math.round(clr.g/25.5)*0.1, Math.round(clr.b/25.5)*0.1])
//    .reduce((flat,toFlatten) => flat.concat(toFlatten))
//    .map((component)=>(component + ''))//.substr(0,3))
//    .reduce((flat,toFlatten) => flat.concat(toFlatten + ', '));
//console.log(colorsRGBArray);

function start() {
    var color = colorsArray[0];
    paintCtx.beginPath();
    paintCtx.fillStyle = color;
    paintCtx.moveTo(1024, 1024)
    paintCtx.arc(1024, 1024, 128, 0, Math.PI * 2, false);
    paintCtx.fill();
    var color = colorsArray[1];
    paintCtx.beginPath();
    paintCtx.fillStyle = color;
    paintCtx.moveTo(0, 0)
    paintCtx.arc(0, 0, 512, 0, Math.PI * 2, false);
    paintCtx.fill();
    var color = colorsArray[2];
    paintCtx.beginPath();
    paintCtx.fillStyle = color;
    paintCtx.moveTo(0, 2048)
    paintCtx.arc(0, 2048, 512, 0, Math.PI * 2, false);
    paintCtx.fill();
    var color = colorsArray[3];
    paintCtx.beginPath();
    paintCtx.fillStyle = color;
    paintCtx.moveTo(2048, 0)
    paintCtx.arc(2048, 0, 512, 0, Math.PI * 2, false);
    paintCtx.fill();
    var color = colorsArray[4];
    paintCtx.beginPath();
    paintCtx.fillStyle = color;
    paintCtx.moveTo(2048, 2048)
    paintCtx.arc(2048, 2048, 512, 0, Math.PI * 2, false);
    paintCtx.fill();
    //    for (var i = 0; i < 1000; i++) {
    //        var color = colorsArray[Math.floor(Math.random() * 8)];
    //        var circleX = Math.round(Math.random() * 2047);
    //        var circleY = Math.round(Math.random() * 2047);
    //        paintCtx.beginPath();
    //        paintCtx.fillStyle = color;
    //        paintCtx.moveTo(circleX, circleY)
    //        paintCtx.arc(circleX, circleY, 60, 0, Math.PI * 2, false);
    //        paintCtx.fill();
    //    }
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
    gl.viewport(0, 0, 2048, 2048); //set the viewport to the whole display

    // look up where the vertex data needs to go.
    locCache = new LocationsCache(gl, program, ['a_position', 'u_resolutionTotal', 'u_vxDrawFromBuffer', 'u_fgDrawFromBuffer', 'u_flipY', 'u_playerClrs', 'u_positionIn', 'u_resolutionInNorm', 'u_positionOut', 'u_resolutionOut', 'u_canvasDest', 'u_textureIn', 'u_copy']);

    gl.uniform1f(locCache.getLoc('u_copy'), 0);
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

    //setup uniforms for combining buffer with destination data
    gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
    gl.uniform2fv(locCache.getLoc('u_resolutionTotal'), [2048, 2048]);
    var playerClrs = [
            0.2549019607843137, 0.5254901960784314, 0.9372549019607843,
            0.3411764705882353, 0.7725490196078432, 0.7215686274509804,
            0.9254901960784314, 0.8784313725490196, 0.9490196078431372,
            0.9254901960784314, 0.7843137254901961, 0.1843137254901961,
            0.9490196078431372, 0.5450980392156862, 0.19215686274509805,
            0.9215686274509803, 0.30196078431372547, 0.30196078431372547,
            0.9254901960784314, 0.3254901960784314, 0.6745098039215687,
            0.6, 0.3137254901960784, 0.7058823529411765,
        ];
    gl.uniform3fv(locCache.getLoc('u_playerClrs'), playerClrs); //players colors array

    gl.uniform2fv(locCache.getLoc('u_resolutionInNorm'), [1 / 2048, 1 / 2048]);
    var meldPixels = function(outX, outY, outW, outH, inX, inY, inW, inH, texIn, texInLocNum, fbOut) {
        //compute from inputTex into texAtlas1
        gl.uniform2fv(locCache.getLoc('u_positionOut'), [outX, outY]);
        gl.uniform2fv(locCache.getLoc('u_resolutionOut'), [outW, outH]);
        gl.uniform2fv(locCache.getLoc('u_positionIn'), [inX, inY]);
        gl.uniform2fv(locCache.getLoc('u_resolutionInNorm'), [1 / inW, 1 / inH]);

        setRectangle(gl, outX, outY, outW, outH);
        //from
        gl.uniform1i(locCache.getLoc('u_textureIn'), texInLocNum);
        gl.activeTexture(gl.TEXTURE0 + texInLocNum);
        gl.bindTexture(gl.TEXTURE_2D, texIn);
        //into
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    var copyPixels = function(size, texIn, texInLocNum, fbOut) {
        //copy from texAtlas1 into texAtlas2 
        gl.uniform1f(locCache.getLoc('u_copy'), 1);
        setRectangle(gl, 0, 0, size, size);

        gl.uniform1i(locCache.getLoc('u_textureIn'), texInLocNum);
        gl.activeTexture(gl.TEXTURE0 + texInLocNum);
        gl.bindTexture(gl.TEXTURE_2D, texIn);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.uniform1f(locCache.getLoc('u_copy'), 0);
    }

    meldPixels(0, 0, 512, 512, 0, 0, 2048, 2048, texInput, 0, fbo1);
    copyPixels(2048, texAtlas1, 1, fbo2);
    meldPixels(512, 0, 128, 128, 0, 0, 2048, 2048, texAtlas2, 2, fbo1);
    copyPixels(2048, texAtlas1, 1, fbo2);
    meldPixels(640, 0, 32, 32, 512, 0, 2048, 2048, texAtlas2, 2, fbo1);
    copyPixels(2048, texAtlas1, 1, fbo2);
    meldPixels(672, 0, 8, 8, 640, 0, 2048, 2048, texAtlas2, 2, fbo1);
    copyPixels(2048, texAtlas1, 1, fbo2);
    meldPixels(680, 0, 2, 2, 672, 0, 2048, 2048, texAtlas2, 2, fbo1);

    //copy to onscreen buffer
    gl.uniform1f(locCache.getLoc('u_flipY'), -1); //flip the y axis
    copyPixels(2048, texAtlas1, 1, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    var pixels = new Uint8Array(16);
    gl.readPixels(680, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    //scores is an array that will hold the amount of paint each player has
    var scores = new Uint8Array(4);
    for (var i = 0; i < 4; i++) {
        scores[i] = pixels[3+4*i];
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