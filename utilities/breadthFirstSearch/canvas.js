var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cv2 = document.getElementById("canvas2");
var lay2 = cv2.getContext("2d");
var cellSize = 34;
var borderSize = 1;
var paddedStart = (borderSize)

function drawSquare(x, y, clr) {
    ctx.fillStyle = clr;
    ctx.fillRect(borderSize + x * (cellSize + 2), borderSize + y * (cellSize + 2), cellSize, cellSize);
}

function highlightNode(x, y) {
    ctx.strokeStyle = '#ff3333';
    ctx.strokeRect(borderSize + x * (cellSize + 2) + 1, borderSize + y * (cellSize + 2) + 1, cellSize - 2, cellSize - 2);
    ctx.stroke();
}

function drawDirArrow(x, y, dir) {
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
}

function initialPopulation(size) {
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            drawSquare(x, y, '#ddd');
        }
    }
}

initialPopulation(42);