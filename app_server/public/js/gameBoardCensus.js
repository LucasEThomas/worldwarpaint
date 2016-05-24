class GameBoardCensus {
    constructor(canvas, texInput) {
        this.initializeGL(canvas, texInput);
        this.tiles = [];
        for (var i = 0; i < 4096; i++) {
            this.tiles.push(new CensusTile());
        }
        this.registeredTiles = [];
        this.data = new Uint8Array(16384);
    }
    registerSplatter(x, y, w, h) {
        let lowerXbound = Math.floor(x * 0.03125); //0.03125 = 1/32
        let upperXbound = Math.floor((x + w) * 0.03125);
        let lowerYbound = Math.floor(y * 0.03125);
        let upperYbound = Math.floor((y + h) * 0.03125);
        lowerXbound = (lowerXbound >= 0) ? lowerXbound : 0;
        upperXbound = (upperXbound <= 63) ? upperXbound : 63;
        lowerYbound = (lowerYbound >= 0) ? lowerYbound : 0;
        upperYbound = (upperYbound <= 63) ? upperYbound : 63;

        //console.log(`xlo:${lowerXbound} xhi:${upperXbound} ylo:${lowerYbound} yhi:${upperYbound}`);

        for (var j = lowerXbound; j <= upperXbound; j++) {
            for (var k = lowerYbound; k <= upperYbound; k++) {
                if (!this.tiles[j + k * 64].selected) {
                    this.tiles[j + k * 64].selected = true;
                    this.registeredTiles.push({
                        x: j,
                        y: k
                    });
                }
            }
        }
    }
    performCensus(onFinish) {
        if (this.registeredTiles.length) {
            this.countPixels(this.registeredTiles.slice(), (processedRects) => {
                let totalScoreChange = 0;
                processedRects.forEach((tile, index) => {
                    let arrayLocation = tile.x + tile.y * 64
                    this.tiles[arrayLocation].selected = false;
                    let newClr = {
                        r: this.data[0 + arrayLocation * 4],
                        g: this.data[1 + arrayLocation * 4],
                        b: this.data[2 + arrayLocation * 4]
                    };
                    let newScore = Math.floor(this.data[3 + arrayLocation * 4]);
                    totalScoreChange += this.tiles[arrayLocation].calculateScoreChange(game.player.clr, newClr, newScore);
                    this.tiles[arrayLocation].doUpdate(newClr, newScore);
                });
                onFinish(totalScoreChange);
            });
            this.registeredTiles = [];
        }
    }

    initializeGL(gl, texInput) {
        this.gl = gl;

        // Get A WebGL context
        if (!gl) {
            console.error('no gl')
            return;
        }

        // setup GLSL program
        let vertexShader = createShaderFromScriptElement(gl, "census-vertex-shader");
        let histogramShader = createShaderFromScriptElement(gl, "census-fragment-shader");
        this.program = createProgram(gl, [vertexShader, histogramShader]);
        gl.useProgram(this.program);

        // look up where the vertex data needs to go.
        let locCache = this.locCache = new LocationsCache(gl, this.program, ['a_positionOut', 'u_resolutionOriginal', 'u_flipY', 'u_playerClrs', 'u_resolutionInNorm', 'u_reductionFactorFG', 'u_reductionFactorVX', 'u_textureIn']);

        // Create a buffer for the position of the rects corners.
        this.rectsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.rectsBuffer);
        gl.enableVertexAttribArray(locCache.getLoc('a_positionOut'));
        gl.vertexAttribPointer(locCache.getLoc('a_positionOut'), 2, gl.FLOAT, false, 0, 0);

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
        this.texInput = texInput;
        this.tex1 = setupTexture(512, 512, 4, this.program, 'u_textureIn');
        this.tex2 = setupTexture(128, 128, 5, this.program, 'u_textureIn');
        this.tex3 = setupTexture(64, 64, 6, this.program, 'u_textureIn');

        // Create a framebuffer and attach tex1 to it
        this.fbo1 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex1, 0);

        // Create a framebuffer and attach tex2 to it
        this.fbo2 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo2);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex2, 0);

        // Create a framebuffer and attach tex3 to it
        this.fbo3 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo3);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex3, 0);

        //setup uniforms for combining buffer with destination data
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
        gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
        gl.uniform2fv(locCache.getLoc('u_resolutionOriginal'), [2048, 2048]);
    }

    // Counts the pixels of each player's color (taking alpha into account)
    countPixels(rects, onFinishCallback) {
        let gl = this.gl;
        let locCache = this.locCache;

        var meldPixels = (rects, reductionFactor, outW, outH, inW, inH, texIn, texInLocNum, fbOut) => {
            //compute from inputTex into tex1
            gl.useProgram(this.program);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.rectsBuffer);
            gl.enableVertexAttribArray(locCache.getLoc('a_positionOut'));
            gl.vertexAttribPointer(locCache.getLoc('a_positionOut'), 2, gl.FLOAT, false, 0, 0);

            this.setRectangles(gl, rects, reductionFactor);
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
        setTimeout(() => {
            meldPixels(rects, 4, 512, 512, 2048, 2048, this.texInput, 2, this.fbo1);
            gl.flush();
        }, 0);

        setTimeout(() => {
            meldPixels(rects, 4, 128, 128, 512, 512, this.tex1, 4, this.fbo2);
            gl.flush();
        }, 100);

        setTimeout(() => {
            meldPixels(rects, 2, 64, 64, 128, 128, this.tex2, 5, this.fbo3);
            gl.flush();
        }, 200);

        setTimeout(() => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo3);
            gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
            var testCtx = document.getElementById("canvasTest64").getContext("2d");
            var data = new ImageData(new Uint8ClampedArray(this.data), 64, 64);
            testCtx.putImageData(data, 0, 0);
            onFinishCallback(rects);
        }, 300);
    }

    setRectangles(gl, rectangles, reductionFactor) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.rectsBuffer);
        let reductionNorm = 1 / reductionFactor;
        let width = 32 * reductionNorm;
        let height = 32 * reductionNorm;
        let bufferBuilder = [];
        for (var i = 0; i < rectangles.length; i++) {
            let rectangle = rectangles[i];
            let x = rectangle.x * 32 * reductionNorm;
            let y = rectangle.y * 32 * reductionNorm;

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
}

class CensusTile {
    constructor() {
        this.selected = false;
        this.onChangeCallback;
        this.residents = [];
        this.clr = {
            r: 0,
            g: 0,
            b: 0
        };
        this.score = 0;
    }
    doUpdate(newClr, newScore) {
        if (!Utility.compareClr(newClr, this.clr) || newScore !== this.score) {
            this.clr = newClr;
            if (this.onChangeCallback) {
                this.onChangeCallback(newClr, newScore - this.score);
            }
            this.score = newScore;
        }
    }
    calculateScoreChange(myClr, newClr, newScore) {
        let oldClr = this.clr;
        if (Utility.compareClr(oldClr, newClr)) { //no color change happened
            //console.log(oldClr);
            //console.log(newClr);
            //console.log(myClr);
            if (Utility.compareClr(newClr, myClr)) { //if it's my color
                return newScore - this.score;
            } else { //if it's not my color
                return 0;
            }
        } else { //a color change happened
            if (Utility.compareClr(newClr, myClr)) { //if it changed to my color
                return newScore;
            } else if (Utility.compareClr(oldClr, myClr)){ //if it changed from my color
                return -newScore;
            }
            else{
                return 0;
            }
        }
    }


}