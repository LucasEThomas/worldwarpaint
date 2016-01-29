
var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, 'phaser_container', { preload: preload, create: create, update: update, render : render });


function preload() {
    game.stage.disableVisibilityChange = true;  
    game.stage.backgroundColor = '#007236';

    game.load.image('background', 'assets/background.jpg');
    game.load.image('blueButton1', 'assets/BlueButton1.png');
    game.load.image('blueButton2', 'assets/BlueButton2.png');
    game.load.image('blueButton3', 'assets/BlueButton3.png');
    game.load.image('blueButton4', 'assets/BlueButton4.png');
    game.load.image('towerBlue1', 'assets/TowerBlue1.png');
    game.load.image('towerBlue2', 'assets/TowerBlue2.png');
    game.load.image('towerBlue3', 'assets/TowerBlue3.png');
    game.load.image('towerBlue4', 'assets/TowerBlue4.png');
    game.load.image('notebookPaper', 'assets/tileableNotebookPaper.png');
    
    var canvas = document.getElementById("gameboard_canvas");
    gameBoardLayer.gameBoardDestination.initialize(canvas);
}

var cursors;
var logo1;
var logo2;
var backgroundLayerSprite; //The game layer where the unchanging background terrain image is drawn.
var gameBoardLayerSprite;

function create() {

    //  Modify the world and camera bounds
    game.world.setBounds(0, 0, 2048, 2048);
    $(window).resize(function() { window.resizeGame(); } );
    
    //draw the background layer
    backgroundLayerSprite = game.add.tileSprite(0, 0, 2048, 2048, 'notebookPaper');
    
    //create the gameboard bitmap data that we can draw stuff to
    gameBoardLayer.initialize();
    
    //initialize the connection with the game server.
    gameServer.initialize();

    //setup the game input so that it works (I think is what this does)
    cursors = game.input.keyboard.createCursorKeys();
    
    //make the tower buttons!!!
    towerButton.makeButtons();
}

var keyboardScrollSpeed = 16;

var eventQueue = [];
function update() {
    //if the the time has come for the next item in the queue to be executed, add it to the renderQueue
    currentTime = (new Date()).getTime();
    if(eventQueue.length && eventQueue[0].scheduledTime <= currentTime){
        var currentTimeSlot = eventQueue.shift();
        for(var currentEvent of currentTimeSlot){
            
            //todo, need to break out into another method that decides what to do with each event in the timeSlot
            if(currentEvent.type === 'sprinklerTower'){
                for(var currentGeometry of currentEvent.data){
                    gameBoardLayer.drawSprinkle(currentGeometry.x, currentGeometry.y, currentGeometry.radius, {r:255,g:0,b:0});
                }
            }
        }
        
    }
    //bandaid fix for when the browser looses focus and the eventQueue just piles up. Don't wanna memory leak!
    if(eventQueue.length > 1000){
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
    
    if (towerDrag)
    {
        tower.dragCord();   
    }

}

renderQueue = [];
function render() {
    game.debug.cameraInfo(game.camera, 32, 32);

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