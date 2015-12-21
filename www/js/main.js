
var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render : render });


function preload() {

    game.stage.backgroundColor = '#007236';

    game.load.image('mushroom', 'assets/sprites/mushroom2.png');
    game.load.image('sonic', 'assets/sprites/sonic_havok_sanity.png');
    game.load.image('phaser', 'assets/sprites/asdf.png');
    game.load.image('background', 'assets/background.jpg');
    game.load.image('blueButton1', 'assets/BlueButton1.png');
    game.load.image('blueButton2', 'assets/BlueButton2.png');
    game.load.image('blueButton3', 'assets/BlueButton3.png');
    game.load.image('blueButton4', 'assets/BlueButton4.png');
    game.load.image('towerBlue1', 'assets/TowerBlue1.png');
    game.load.image('towerBlue2', 'assets/TowerBlue2.png');
    game.load.image('towerBlue3', 'assets/TowerBlue3.png');
    game.load.image('towerBlue4', 'assets/TowerBlue4.png');

}

var cursors;
var logo1;
var logo2;
var backgroundSpriteLayer; //The game layer where the unchanging background terrain image is drawn.

function create() {

    //  Modify the world and camera bounds
    game.world.setBounds(0, 0, 3000, 3000);
    $(window).resize(function() { window.resizeGame(); } );
    
    //draw the background layer
    spriteBackgroundLayer = game.add.sprite(0, 0, 'background');
    
    //create the gameboard bitmap data that we can draw stuff to
    gameBoardLayer.initialize();
    
    //draw bezier curves to it
    gameBoardLayer.drawSplotch(700,700);
    gameBoardLayer.drawSplotch(500,500);
    gameBoardLayer.drawSplotch(200,200);
    //gameBoardLayer.drawCircles(300,300,100);
    gameBoardLayer.drawBlob(600,300,200);
    //add a random sprite 200 times. This is just for now.
//    for (var i = 0; i < 200; i++)
//    {
//        game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
//    }

//    game.add.text(0, 0, "this text scrolls\nwith the background", { font: "32px Arial", fill: "#f26c4f", align: "center" });
    
//    logo1 = game.add.sprite(0, 0, 'phaser');
//    logo1.fixedToCamera = true;
//    logo1.cameraOffset.setTo(100, 100);
//
//    logo2 = game.add.sprite(0, 0, 'phaser');
//    logo2.fixedToCamera = true;
//    logo2.cameraOffset.setTo(500, 100);

//    var t = game.add.text(0, 0, "this text is fixed to the camera", { font: "32px Arial", fill: "#ffffff", align: "center" });
//    t.fixedToCamera = true;
//    t.cameraOffset.setTo(200, 500);

//    game.add.tween(logo2.cameraOffset).to( { y: 400 }, 2000, Phaser.Easing.Back.InOut, true, 0, 2000, true);

    cursors = game.input.keyboard.createCursorKeys();
    
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