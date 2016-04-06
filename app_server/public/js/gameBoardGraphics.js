class GameBoardGraphics {
    constructor(canvas) {
        this.locCache;

        this.bufferColors;
        this.inputRectangles;
        this.outputRectangles;
        this.texDest1;
        this.texDest2;
        this.fbo1;
        this.fbo2;
        this.initializeGraphics(canvas);
    }

    //returns true if the rgb value at x,y is close to rgb
    colorMatch(x, y, rgb) {
        y = -y + 2048; //flip y
        var gl = this.gl;
        var pixelValues = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
        return (Math.abs(pixelValues[0] - rgb.r) <= 12 && Math.abs(pixelValues[1] - rgb.g) <= 12 && Math.abs(pixelValues[2] - rgb.b) <= 12);
    }

    render(stageInputRects, stageOutputRects, stageOutputColors) {
        var gl = this.gl;
        var locCache = this.locCache;
        //tell the shader the rectangles and colors to update and clear the staging buffers
        var numOfVertices = stageOutputColors.length * 6;
        this.setInputRectangles(gl, stageInputRects);
        this.setOutputRectangles(gl, stageOutputRects);
        this.setColors(gl, stageOutputColors);

        gl.uniform2f(locCache.getLoc('u_finalOutResolution'), 2048, 2048);
        var matrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
        gl.uniformMatrix3fv(locCache.getLoc('u_matrixa'), false, matrix);

        gl.uniform1f(locCache.getLoc('u_flipY'), 1); //flip the y axis
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //todo use this instead somehow

        //tell it to write from texDest1
        gl.uniform1i(locCache.getLoc('u_drawMode'), 0); //drawMode perform 
        gl.uniform1i(locCache.getLoc('u_canvasDest'), 1);
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, this.texDest1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo2);
        gl.drawArrays(gl.TRIANGLES, 0, numOfVertices);

        //now copy result back to texDest1
        gl.uniform1i(locCache.getLoc('u_drawMode'), 1); //drawMode copy
        gl.uniform1i(locCache.getLoc('u_canvasDest'), 2);
        gl.activeTexture(gl.TEXTURE0 + 2);
        gl.bindTexture(gl.TEXTURE_2D, this.texDest2); //bind the last destination texture as the input to this draw
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo1); //set the framebuffer we're rendering into (output)
        gl.drawArrays(gl.TRIANGLES, 0, numOfVertices); //do the draw

        //render the result to the screen
        gl.uniform1i(locCache.getLoc('u_drawMode'), 2); //drawMode output
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); //now, render to the screen not a framebuffer
        gl.uniform1f(locCache.getLoc('u_flipY'), -1); //don't flip the y axis for this operation
        gl.uniform2f(locCache.getLoc('u_finalOutResolution'), 3548, 2048);
        matrix = [
             0.5, 0.5, 0,
            -0.5, 0.5, 0,
             0.5, 0, 1
        ];
        gl.uniformMatrix3fv(locCache.getLoc('u_matrixa'), false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, numOfVertices); //do the draw
    }

    setOutputRectangles(gl, rectangles) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.outputRectangles);
        var bufferBuilder = [];
        for (var i = 0; i < rectangles.length; i++) {
            var rectangle = rectangles[i];
            var x1 = rectangle.x;
            var x2 = rectangle.x + rectangle.width;
            var y1 = rectangle.y;
            var y2 = rectangle.y + rectangle.height;

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
    setInputRectangles(gl, rectangles) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.inputRectangles);
        var bufferBuilder = [];
        for (var i = 0; i < rectangles.length; i++) {
            var rectangle = rectangles[i];
            var x1 = rectangle.x;
            var x2 = rectangle.x + rectangle.width;
            var y1 = rectangle.y;
            var y2 = rectangle.y + rectangle.height;

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

    setColors(gl, colors) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferColors);
        var bufferBuilder = [];
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            var r = color.r / 255;
            var g = color.g / 255;
            var b = color.b / 255;
            bufferBuilder.push(
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1
            );
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferBuilder), gl.STATIC_DRAW);
    }

    initializeGraphics(canvas) {
        this.gl = canvas.getContext("webgl", {
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });

        var gl = this.gl;
        // Get A WebGL context
        if (!gl) {
            console.error('no gl')
            return;
        }

        // setup GLSL program
        var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
        var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
        //histogramShader = createShaderFromScriptElement(gl, "histogram-fragment-shader");
        var program = createProgram(gl, [vertexShader, fragmentShader]);
        //histogramProgram = createProgram(gl, [vertexShader, histogramShader]);
        gl.useProgram(program);
        gl.viewport(0, 0, 3548, 2048); //set the viewport to the whole display

        // look up where the vertex data needs to go.
        var locCache = this.locCache = new LocationsCache(gl, program, ['a_inputRects', 'a_outputRects', 'a_colors', 'u_inResolution', 'u_outResolution', 'u_finalOutResolution', 'u_matrixa', 'u_drawMode', 'u_flipY', 'u_canvasDest']);
        
        // lookup uniforms

        // set the resolution
        gl.uniform2f(locCache.getLoc('u_inResolution'), 1024, 1024);
        gl.uniform2f(locCache.getLoc('u_outResolution'), 2048, 2048);

        var matrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];

        gl.uniformMatrix3fv(locCache.getLoc('u_matrixa'), false, matrix);

        // Create a buffer for the position of the input rectangle corners.

        var createShaderBuffer = function(name, depth) {
            var newBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
            gl.enableVertexAttribArray(locCache.getLoc(name));
            gl.vertexAttribPointer(locCache.getLoc(name), depth, gl.FLOAT, false, 0, 0);
            return newBuffer;
        }
        this.inputRectangles = createShaderBuffer('a_inputRects', 2);
        this.outputRectangles = createShaderBuffer('a_outputRects', 2);
        this.bufferColors = createShaderBuffer('a_colors', 4);

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

        var wildFlowersBitmapData = game.make.bitmapData(2048, 2048);
        var wildFlowersImage = game.make.image(0, 0, 'wildFlowerNoise');
        wildFlowersBitmapData.draw(wildFlowersImage);
        wildFlowersBitmapData.update();
        var wildFlowersImageData = wildFlowersBitmapData.imageData;

        var splattersBitmapData = game.make.bitmapData(1024, 1024);
        var splattersImage = game.make.image(0, 0, 'splatters');
        splattersBitmapData.draw(splattersImage);
        splattersBitmapData.update();
        var splattersImageData = splattersBitmapData.imageData;

        //setup the textures
        setupTexture(splattersImageData, 0, program, "u_canvasBuff");
        setupTexture(wildFlowersImageData, 3, program, "u_wildFlowersMask");
        this.texDest1 = setupTexture(canvas, 1, program, "asdf");
        this.texDest2 = setupTexture(canvas, 2, program, "asdf");

        // Create a framebuffer and attach texDest1 to it
        this.fbo1 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texDest1, 0);

        // Create a framebuffer and attach texDest2 to it
        this.fbo2 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo2);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texDest2, 0);
    }

    // Counts the pixels of each player's color (taking alpha into account)
    //countPixels(){
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
        }
        else{
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