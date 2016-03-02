"use strict";
//var Player = require('./player.js');
//var tower = require('./tower.js');

var player = new Player();

function startPhaser(playerType) {
    $('#setupContainer').remove();
    player.type = playerType;
    game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, 'phaser_container', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });
}
var game;
var playerType = '';

function preload() {
    game.time.advancedTiming = true;
    game.stage.disableVisibilityChange = true;
    game.stage.backgroundColor = '#fff';
    game.plugins.add(new Phaser.Plugin.Isometric(game, undefined, Phaser.Plugin.Isometric.ISOMETRIC));
    //game.iso.anchor.setTo(0.5, 0);

    game.load.image('background', 'assets/background.jpg');
    game.load.image('blueButton1', 'assets/BlueButton1.png');
    game.load.image('blueButton2', 'assets/BlueButton2.png');
    game.load.image('blueButton3', 'assets/BlueButton3.png');
    game.load.image('blueButton4', 'assets/BlueButton4.png');
    game.load.image('tower', 'assets/forestPack/tower1x2.png');
    game.load.image('towerBlue1', 'assets/TowerBlue1.png');
    game.load.image('towerBlue2', 'assets/TowerBlue2.png');
    game.load.image('towerBlue3', 'assets/TowerBlue3.png');
    game.load.image('towerBlue4', 'assets/TowerBlue4.png');
    game.load.image('notebookPaper', 'assets/isometricNotebookPaper.png');
    game.load.image('splatters', 'assets/splatters.png');
    game.load.image('grass1', 'assets/forestPack/grass0x2.png');
    game.load.image('grass2', 'assets/forestPack/grass1x2.png');
}

var cursors;
var logo1;
var logo2;
var backgroundLayerSprite; //The game layer where the unchanging background terrain image is drawn.
var gameBoardLayerSprite;

var terrainRenderTexture;
var unitsGroup;

function create() {

    var spawnRenderTextureTiles = function() {
        terrainRenderTexture = game.add.renderTexture(3548, 2048, 'terrainBackground');
        var noteTile = game.make.sprite(0, 0, 'notebookPaper');
        noteTile.anchor.set(.5);
        for (var nx = 0; nx < 4096; nx += 1132) {
            for (var ny = 0; ny < 4096; ny += 654) {
                terrainRenderTexture.renderXY(noteTile, nx, ny);
                terrainRenderTexture.renderXY(noteTile, nx + 1132 / 2, ny + 654 / 2);
            }
        }
        for (var xx = 0; xx < 2048; xx += 45) {
            for (var yy = 0; yy < 2048; yy += 45) {
                // Create a tile using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                var tile = (Math.random() < .9) ? game.make.sprite(0, 0, 'grass1') : game.make.sprite(0, 0, 'grass2');
                tile.anchor.set(0.5);
                var point = game.iso.projectXY({
                    x: xx,
                    y: yy,
                    z: 0
                });
                //console.log(point);
                terrainRenderTexture.renderXY(tile, point.x, point.y);
            }
        }
        game.add.sprite(0, 0, terrainRenderTexture);
    }

    var canvas = document.getElementById("gameboard_canvas");
    gameBoardLayer.gameBoardDestination.initialize(canvas);

    //  Modify the world and camera bounds
    game.world.setBounds(0, 0, 3548, 2048);
    $(window).resize(function() {
        window.resizeGame();
    });

    //create the gameboard bitmap data that we can draw stuff to
    spawnRenderTextureTiles();
    gameBoardLayer.initialize();

    //initialize the connection with the game server.
    gameServer.initialize(player.type);

    //setup the game input so that it works (I think is what this does)
    cursors = game.input.keyboard.createCursorKeys();

    game.canvas.oncontextmenu = function(e) {
        e.preventDefault();
        if (player.type === 'champion' || player.type === 'archer')
            gameServer.moveHero(game.input.worldX, game.input.worldY);
    }

    unitsGroup = game.add.group();
    game.iso.topologicalSort(unitsGroup);
    //make the tower buttons!!!
    towerButton.makeButtons();
}

var keyboardScrollSpeed = 16;

var eventQueue = [];

function update() {
    //if the the time has come for the next item in the queue to be executed, add it to the renderQueue
    var currentTime = (new Date()).getTime();
    if (eventQueue.length && eventQueue[0].scheduledTime <= currentTime) {
        var currentTimeSlot = eventQueue.shift();
        for (var currentEvent of currentTimeSlot) {

            //todo, need to break out into another method that decides what to do with each event in the timeSlot
            if (currentEvent.type === 'sprinklerUnit') {
                for (var currentGeometry of currentEvent.data) {
                    gameBoardLayer.stageSplatter(
                        currentGeometry.x,
                        currentGeometry.y,
                        currentGeometry.radius,
                        getPlayerClr(currentEvent.ownerID),
                        currentGeometry.inputIndex);
                }
            } else if (currentEvent.type === 'manualSplatter') {
                var currentGeometry = currentEvent.data[0];
                gameBoardLayer.stageSplatter(
                    currentGeometry.x,
                    currentGeometry.y,
                    currentGeometry.radius,
                    getPlayerClr(currentEvent.ownerID),
                    currentGeometry.inputIndex);
            } else if (currentEvent.type === 'moveUnit') {
                var data = currentEvent.data;
                towers.forEach((tower, index) => {
                    if (tower.id === data.id) {
                        tower.x = data.x;
                        tower.y = data.y;
                    }
                });
            }

        }

    }
    //bandaid fix for when the browser looses focus and the eventQueue just piles up. Don't wanna memory leak!
    if (eventQueue.length > 10) {
        eventQueue.length = 0;
    }

    if (cursors.up.isDown)
        game.camera.y -= keyboardScrollSpeed;
    if (cursors.down.isDown)
        game.camera.y += keyboardScrollSpeed;
    if (cursors.left.isDown)
        game.camera.x -= keyboardScrollSpeed;
    if (cursors.right.isDown)
        game.camera.x += keyboardScrollSpeed;

    if (towerDrag) {
        tower.dragCord();
    }
    game.iso.simpleSort(unitsGroup);

}

var renderQueue = [];

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.text('fps:' + (game.time.fps || '--'), 32, 115);
    gameBoardLayer.gameBoardDestination.render();
}

function resizeGame() {
    var height = $(window).height();
    var width = $(window).width();

    game.width = width;
    game.height = height;
    game.canvas.width = width;
    game.canvas.height = height;
    game.scale.width = width;
    game.scale.height = height;
    game.camera.setSize(width, height);
    game.renderer.resize(width, height);
}