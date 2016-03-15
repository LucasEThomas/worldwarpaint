var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cv2 = document.getElementById("canvas2");
var lay2 = cv2.getContext("2d");
var cellSize = 34;
var borderSize = 2;
var paddedStart = (borderSize);

/*var id = lay2.createImageData(1, 1); // only do this once per page
var d = id.data; // only do this once per page
d[0] = 255;
d[1] = 0;
d[2] = 0;
d[3] = 255;
lay2.putImageData(id, 0, 0);
lay2.putImageData(id, 1, 1);
lay2.putImageData(id, 36, 1);
lay2.putImageData(id, 37, 2);
lay2.putImageData(id, 35, 35);
lay2.putImageData(id, 38, 35);*/

function drawSquare(x, y, clr) {
    ctx.fillStyle = clr;
    ctx.fillRect(borderSize + x * (cellSize + 2), borderSize + y * (cellSize + 2), cellSize, cellSize);
}

function highlightNode(x, y) {
    ctx.strokeStyle = '#ff3333';
    ctx.strokeRect(borderSize + x * (cellSize + 2) + 1, borderSize + y * (cellSize + 2) + 1, cellSize - 2, cellSize - 2);
    ctx.stroke();
}

/*function drawDirArrow(x, y, dir) {
    var startLine = [0, 0];
    var endLine = [0, 0];
    switch (dir) {
        // I wish you could disable switch/case fall-through...
        case 0:
            // right
            fromX = borderSize + x * (cellSize + 2) + 4;
            fromY = borderSize + y * (cellSize + 2) + (cellSize / 2);
            toX = borderSize + x * (cellSize + 2) + (cellSize - 4);
            toY = borderSize + y * (cellSize + 2) + (cellSize / 2);
            break;
        case 1:
            // down
            fromX = borderSize + x * (cellSize + 2) + (cellSize / 2);
            fromY = borderSize + y * (cellSize + 2) + 4;
            toX = borderSize + x * (cellSize + 2) + (cellSize / 2);
            toY = borderSize + y * (cellSize + 2) + (cellSize - 4);
            break;
        case 2:
            // left
            fromX = borderSize + x * (cellSize + 2) + (cellSize - 4);
            fromY = borderSize + y * (cellSize + 2) + (cellSize / 2);
            toX = borderSize + x * (cellSize + 2) + 4;
            toY = borderSize + y * (cellSize + 2) + (cellSize / 2);
            break;
        case 3:
            // up
            fromX = borderSize + x * (cellSize + 2) + (cellSize / 2);
            fromY = borderSize + y * (cellSize + 2) + (cellSize - 4);
            toX = borderSize + x * (cellSize + 2) + (cellSize / 2);
            toY = borderSize + y * (cellSize + 2) + 4;
            break;
    }
    lay2.beginPath();
    var headlen = 10; // length of head in pixels
    var angle = Math.atan2(toY - fromY, toX - fromX);
    lay2.moveTo(fromX, fromY);
    lay2.lineTo(toX, toY);
    lay2.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    lay2.moveTo(toX, toY);
    lay2.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    lay2.stroke();
}*/

function initialPopulation(w, h) {
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            drawSquare(x, y, '#eee');
        }
    }
}

// get mouse position in canvas relative to placement of canvas on the screen
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function getGraphPos(canvas, event) {
    var mousePos = getMousePos(canvas, event);

    // translate mouse coordinates to grid coordinates
    var gridX = Math.ceil(mousePos.x / (cellSize + borderSize)) - 1;
    var gridY = Math.ceil(mousePos.y / (cellSize + borderSize)) - 1;

    return [gridX, gridY];
}