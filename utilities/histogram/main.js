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

    initializeShaders();
    var rects = [];
    for (var x = 0; x <= 64; x += 1) {
        for (var y = 0; y <= 64; y += 2) {
            rects.push({
                x: x,
                y: y
            });
        }
    }
    countPixels(rects);
}

var offset = 0;
function refresh() {
    for (var i = 0; i < 20; i++) {
        var color = colorsArray[Math.floor(Math.random() * 8)];
        var circleX = Math.round(Math.random() * 2048);
        var circleY = Math.round(Math.random() * 2048);
        paintCtx.beginPath();
        paintCtx.fillStyle = color;
        paintCtx.moveTo(circleX, circleY)
        paintCtx.arc(circleX, circleY, 1000 - (i * 40), 0, Math.PI * 2, false);
        paintCtx.fill();
    }
    initializeShaders();

    var rects = [];
    for (var x = offset % 2; x <= 64; x += 8) {
        for (var y = Math.floor((offset / 2)) % 2; y <= 64; y += 8) {
            rects.push({
                x: x,
                y: y
            });
        }
    }
    offset = (offset + 1) % 4
    countPixels(rects);
}

function tileToPixelSpace(pnt) {
    return {
        x: Math.floor(pnt.x / 32),
        y: Math.floor(pnt.y / 32)
    };
}

var gl;
var program;
var locCache;

function initializeShaders() {
    var startTime = Date.now();
    console.log('time=0 start initialzation');
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
    locCache = new LocationsCache(gl, program, ['a_positionOut', 'u_resolutionOriginal', 'u_flipY', 'u_playerClrs', 'u_resolutionIn', 'u_resolutionInNorm', 'u_resolutionOut', 'u_reductionFactorFG', 'u_reductionFactorVX', 'u_textureIn']);

    // Create a buffer for the position of the rectangle corners.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(locCache.getLoc('a_positionOut'));
    gl.vertexAttribPointer(locCache.getLoc('a_positionOut'), 2, gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    //setRectangle(gl, 0, 0, canvasGl.width, canvasGl.height);

    function setupTexture(width, height, textureUnit, program, uniformName) {
        var tex = gl.createTexture();

        //update Texture From Canvas
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

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
    texInput = setupTexture(2048, 2048, 0, program, 'u_textureIn');
    texAtlas1 = setupTexture(512, 512, 1, program, 'u_textureIn');
    texAtlas2 = setupTexture(128, 128, 2, program, 'u_textureIn');
    texAtlas3 = setupTexture(64, 64, 3, program, 'u_textureIn');

    // Create a framebuffer and attach texAtlas1 to it
    fbo1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texAtlas1, 0);

    // Create a framebuffer and attach texAtlas2 to it
    fbo2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texAtlas2, 0);

    // Create a framebuffer and attach texAtlas3 to it
    fbo3 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo3);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texAtlas3, 0);

    //setup uniforms for combining buffer with destination data
    gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
    gl.uniform2fv(locCache.getLoc('u_resolutionOriginal'), [2048, 2048]);
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
    console.log('time=' + (Date.now() - startTime) + ' end initialzation');
}

var texInput;
var texAtlas1;
var texAtlas2;
var texAtlas3;
var fbo1;
var fbo2;
var fbo3;

// Counts the pixels of each player's color (taking alpha into account)
function countPixels(rects) {

    var startTime = Date.now();
    console.log('time=0 start countPixels')

    //load the paint canvas data into inputTex
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texInput);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2048, 2048, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(paintCtx.getImageData(0, 0, 2048, 2048).data));
    console.log('time=' + (Date.now() - startTime) + ' done loading in new image');

    var meldPixels = function(rects, reductionFactor, outW, outH, inW, inH, texIn, texInLocNum, fbOut) {
        //compute from inputTex into texAtlas1

        gl.viewport(0, 0, inW, inH); //set the viewport to the input buffer size
        gl.uniform1f(locCache.getLoc('u_reductionFactorVX'), reductionFactor);
        gl.uniform1f(locCache.getLoc('u_reductionFactorFG'), reductionFactor);
        //gl.uniform2fv(locCache.getLoc('u_resolutionOutFactor'), [1 / outW, 1 / outH]);
        gl.uniform2fv(locCache.getLoc('u_resolutionInNorm'), [1 / inW, 1 / inH]);

        gl.uniform1i(locCache.getLoc('u_textureIn'), texInLocNum);
        gl.activeTexture(gl.TEXTURE0 + texInLocNum);
        gl.bindTexture(gl.TEXTURE_2D, texIn);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
        gl.drawArrays(gl.TRIANGLES, 0, rects.length * 6);
    }

    var copyPixels = function(outW, outH, inW, inH, texIn, texInLocNum, fbOut) {
        //copy from texAtlas1 into texAtlas2 
        gl.viewport(0, 0, 2048, 2048); //set the viewport to the whole display
        gl.uniform1f(locCache.getLoc('u_reductionFactorVX'), 1);
        gl.uniform1f(locCache.getLoc('u_reductionFactorFG'), 1);
        //gl.uniform2fv(locCache.getLoc('u_resolutionOutFactor'), [1 / 2048, 1 / 2048]);
        //gl.uniform2fv(locCache.getLoc('u_resolutionInFactor'), [1 / inW, 1 / inH]);

        gl.uniform1i(locCache.getLoc('u_textureIn'), texInLocNum);
        gl.activeTexture(gl.TEXTURE0 + texInLocNum);
        gl.bindTexture(gl.TEXTURE_2D, texIn);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    console.log('time=' + (Date.now() - startTime) + ' done instantiating functions');

    setRectangles(gl, rects, 4);
    meldPixels(rects, 4, 512, 512, 2048, 2048, texInput, 0, fbo1);
    console.log('time=' + (Date.now() - startTime) + ' shader 1 done');

    setRectangles(gl, rects, 4);
    meldPixels(rects, 4, 128, 128, 512, 512, texAtlas1, 1, fbo2);
    console.log('time=' + (Date.now() - startTime) + ' shader 2 done');

    setRectangles(gl, rects, 2);
    meldPixels(rects, 2, 64, 64, 128, 128, texAtlas2, 2, fbo3);
    console.log('time=' + (Date.now() - startTime) + ' shader 3 done');

    //copy to onscreen buffer
    gl.uniform1f(locCache.getLoc('u_flipY'), -1); //flip the y axis
//    copyPixels(rects, 1024, 1024, 2048, 2048, texInput, 0, null);
    setRectangle(gl, 0,0,2048,2048);
//    copyPixels(2048, 2048, 2048, 2048, texAtlas1, 1, null);
    copyPixels(2048, 2048, 2048, 2048, texAtlas3, 3, null);
//    copyPixels(rects, 1024, 1024, 2048, 2048, texAtlas3, 3, null);

    console.log('time=' + (Date.now() - startTime) + ' copying to workCanvas done');

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo3);
    var pixels = new Uint8Array(16384);
    console.log('time=' + (Date.now() - startTime) + ' array creation done');
    gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log('time=' + (Date.now() - startTime) + ' readPixels done');
    gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log('time=' + (Date.now() - startTime) + ' readPixels again');


    //scores is an array that will hold the amount of paint each player has
    var scores = new Uint8Array(4096);
    for (var i = 0; i < 4096; i++) {
        scores[i] = pixels[3 + 4 * i];
    }
    console.log('time=' + (Date.now() - startTime) + ' array computation done');
    //console.log(scores); //for now, just output to the console.
    var clampedPixels = new Uint8ClampedArray(pixels);



    var testCtx = document.getElementById("canvasTest").getContext("2d");
    var data = new ImageData(clampedPixels, 64, 64);
    testCtx.putImageData(data, 0, 0);
    console.log('time=' + (Date.now() - startTime) + ' test canvas done');

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

function setRectangles(gl, rectangles, reductionFactor) {
    //gl.bindBuffer(gl.ARRAY_BUFFER, this.outputRectangles);
    let reductionNorm = 1 / reductionFactor;
    let width = 32 * reductionNorm;
    let height = 32 * reductionNorm;
    let bufferBuilder = [];
    for (var i = 0; i < rectangles.length; i++) {
        let rectangle = rectangles[i];
        let x = rectangle.x * 32 * reductionNorm;;
        let y = rectangle.y * 32 * reductionNorm;;
        
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;

        bufferBuilder.push(
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        );
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferBuilder), gl.STATIC_DRAW);
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