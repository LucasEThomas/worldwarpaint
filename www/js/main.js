
var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render : render });


function preload() {

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
}

var cursors;
var logo1;
var logo2;
var backgroundLayerSprite; //The game layer where the unchanging background terrain image is drawn.
var gameBoardLayerSprite;

function create() {

    //  Modify the world and camera bounds
    game.world.setBounds(0, 0, 3200, 3200);
    $(window).resize(function() { window.resizeGame(); } );
    
    //draw the background layer
    backgroundLayerSprite = game.add.tileSprite(0, 0, 3200, 3200, 'notebookPaper');
    
    //create the gameboard bitmap data that we can draw stuff to
    gameBoardLayer.initialize();

    //setup the game input so that it works (I think is what this does)
    cursors = game.input.keyboard.createCursorKeys();
    
    //make the tower buttons!!!
    towerButton.makeButtons();
}

var keyboardScrollSpeed = 16;
function update() {

    
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