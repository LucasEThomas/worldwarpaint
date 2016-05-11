function computeAndDisplayRGBArray(colorsArray) {
    console.log(colorsArray);
    var colorsRGBArray = colorsArray
        .map((clr) => hexToRgb(clr))
        .map((clr) => [clr.r / 255, clr.g / 255, clr.b / 255])
        //.map((clr) => [Math.round(clr.r/25.5)*0.1, Math.round(clr.g/25.5)*0.1, Math.round(clr.b/25.5)*0.1])
        .reduce((flat, toFlatten) => flat.concat(toFlatten))
        .map((component) => (component + '')) //.substr(0,3))
        .reduce((flat, toFlatten) => flat.concat(toFlatten + ', '));
    console.log(colorsRGBArray);
}

function generateColorsArray() {
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
    return Object.keys(colorsDict).map((key) => colorsDict[key]);
}

function paintTestInput(){
    let colorsArray = generateColorsArray();

    paintCtx.beginPath();
    paintCtx.fillStyle = colorsArray[0];
    paintCtx.moveTo(1024, 1024)
    paintCtx.arc(1024, 1024, 128, 0, Math.PI * 2, false);
    paintCtx.fill();

    paintCtx.beginPath();
    paintCtx.fillStyle = colorsArray[1];
    paintCtx.moveTo(0, 0)
    paintCtx.arc(0, 0, 512, 0, Math.PI * 2, false);
    paintCtx.fill();

    paintCtx.beginPath();
    paintCtx.fillStyle = colorsArray[2];
    paintCtx.moveTo(0, 2048)
    paintCtx.arc(0, 2048, 512, 0, Math.PI * 2, false);
    paintCtx.fill();

    paintCtx.beginPath();
    paintCtx.fillStyle = colorsArray[3];
    paintCtx.moveTo(2048, 0)
    paintCtx.arc(2048, 0, 512, 0, Math.PI * 2, false);
    paintCtx.fill();

    paintCtx.beginPath();
    paintCtx.fillStyle = colorsArray[4];
    paintCtx.moveTo(2048, 2048)
    paintCtx.arc(2048, 2048, 512, 0, Math.PI * 2, false);
    paintCtx.fill();
}

function paintRandomCircles() {
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
}

function hexToRgb(hex) {
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

function generateCheckeredRects(offset){
    var rects = [];
    for (var x = offset % 2; x <= 64; x += 4) {
        for (var y = Math.floor((offset / 2)) % 2; y <= 64; y += 4) {
            rects.push({
                x: x,
                y: y
            });
        }
    }
    return rects;
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