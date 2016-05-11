class GameBoardCensus {
    constructor(canvas) {
       this.initializeGL(canvas);
    }
    
    initializeGL(canvas){
        var startTime = Date.now();
        console.log('time=0 start initialzation');
        
        var gl = this.gl = getWebGLContext(canvas, {
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });

        // Get A WebGL context
        if (!gl) {
            console.error('no gl')
            return;
        }

        // setup GLSL program
        var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
        var histogramShader = createShaderFromScriptElement(gl, "histogram-fragment-shader");
        this.program = createProgram(gl, [vertexShader, histogramShader]);
        gl.useProgram(this.program);

        // look up where the vertex data needs to go.
        let locCache = this.locCache = new LocationsCache(gl, this.program, ['a_positionOut', 'u_resolutionOriginal', 'u_flipY', 'u_playerClrs', 'u_resolutionInNorm', 'u_reductionFactorFG', 'u_reductionFactorVX', 'u_textureIn']);

        // Create a buffer for the position of the rects corners.
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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
        this.texInput = setupTexture(2048, 2048, 0, this.program, 'u_textureIn');
        this.tex1 = setupTexture(512, 512, 1, this.program, 'u_textureIn');
        this.tex2 = setupTexture(128, 128, 2, this.program, 'u_textureIn');
        this.tex3 = setupTexture(64, 64, 3, this.program, 'u_textureIn');

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

        //setup uniforms for combining buffer with destination data
        gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
        gl.uniform2fv(locCache.getLoc('u_resolutionOriginal'), [2048, 2048]);

        //load the paint canvas data into inputTex
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texInput);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2048, 2048, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(paintCtx.getImageData(0, 0, 2048, 2048).data));
        console.log('time=' + (Date.now() - startTime) + ' done loading in new image');
    }

    // Counts the pixels of each player's color (taking alpha into account)
    countPixels(rects) {
        let gl = this.gl;
        let locCache = this.locCache;
        
        var startTime = Date.now();
        gl.useProgram(this.program);
        console.log('time=0 start countPixels')

        var meldPixels = (rects, reductionFactor, outW, outH, inW, inH, texIn, texInLocNum, fbOut) => {
            //compute from inputTex into tex1

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

        var copyPixels = function(outW, outH, inW, inH, texIn, texInLocNum, fbOut) {
            //copy from tex1 into tex2 
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

        setTimeout(() => {
            meldPixels(rects, 4, 512, 512, 2048, 2048, this.texInput, 0, this.fbo1);
            console.log('time=' + (Date.now() - startTime) + ' shader 1 done');
        }, 0);

        setTimeout(() => {
            meldPixels(rects, 4, 128, 128, 512, 512, this.tex1, 1, this.fbo2);
            console.log('time=' + (Date.now() - startTime) + ' shader 2 done');
        }, 100);

        setTimeout(() => {
            meldPixels(rects, 2, 64, 64, 128, 128, this.tex2, 2, this.fbo3);
            console.log('time=' + (Date.now() - startTime) + ' shader 3 done');
        }, 200);

        setTimeout(() => {
            //copy to onscreen buffer
            gl.uniform1f(locCache.getLoc('u_flipY'), -1); //flip the y axis
            this.setRectangle(gl, 0, 0, 2048, 2048);
            copyPixels(2048, 2048, 2048, 2048, this.texInput, 1, null);
            gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
            //console.log('time=' + (Date.now() - startTime) + ' copying to workCanvas done');

            var pixels = new Uint8Array(16384);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo3);
            gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            console.log('time=' + (Date.now() - startTime) + ' readPixels done');

            //scores is an array that will hold the amount of paint each player has
            var testCtx = document.getElementById("canvasTest").getContext("2d");
            var data = new ImageData(new Uint8ClampedArray(pixels), 64, 64);
            testCtx.putImageData(data, 0, 0);
            console.log('time=' + (Date.now() - startTime) + ' test canvas done');
        }, 300);
    }

    setRectangle(gl, x, y, width, height) {
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2]), gl.STATIC_DRAW);
    }

    setRectangles(gl, rectangles, reductionFactor) {
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.outputRectangles);
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