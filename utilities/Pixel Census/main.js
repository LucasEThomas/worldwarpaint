'use strict'

var paintCtx = document.getElementById("canvasPaint").getContext("2d");
var canvasGL = document.getElementById("canvasGl");
var gameBoardCensus;

function start() {
    paintTestInput();
    gameBoardCensus = new GameBoardCensus(canvasGL);
}

var offset = 0;
function refresh() {
    offset = (offset + 1) % 4 //cycle between 0&3
    let rects = generateCheckeredRects(offset);
    gameBoardCensus.countPixels(rects);
}

start();