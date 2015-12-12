var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render : render });

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

}

var cursors;
var logo1;
var logo2;
var backgroundSpriteLayer; //The game layer where the unchanging background terrain image is drawn.
var gameBoardBmdLayer; //The game board layer. This is the semi-transparent layer where the players' paint colors are drawn.

function create() {

    //  Modify the world and camera bounds
    game.world.setBounds(0, 0, 3000, 3000);
    
    //draw the background layer
    spriteBackgroundLayer = game.add.sprite(0, 0, 'background');
    
    //create the gameboard bitmap data that we can draw stuff to
    gameBoardBmdLayer = game.add.bitmapData(game.world.width, game.world.height);
    
    //draw bezier curves to it
    paintGround.drawSplotch(700,700);
    
    paintGround.drawSplotch(500,500);
    
    paintGround.drawSplotch(200,200);
    
    //add it as a sprite object to the actual game so that we can see it.
    game.add.sprite(0, 0, gameBoardBmdLayer);
    
    
    //add a random sprite
    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom')
    
    for (var i = 0; i < 200; i++)
    {
        game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    }

    game.add.text(0, 0, "this text scrolls\nwith the background", { font: "32px Arial", fill: "#f26c4f", align: "center" });
    
    logo1 = game.add.sprite(0, 0, 'phaser');
    logo1.fixedToCamera = true;
    logo1.cameraOffset.setTo(100, 100);

    logo2 = game.add.sprite(0, 0, 'phaser');
    logo2.fixedToCamera = true;
    logo2.cameraOffset.setTo(500, 100);


    var t = game.add.text(0, 0, "this text is fixed to the camera", { font: "32px Arial", fill: "#ffffff", align: "center" });
    t.fixedToCamera = true;
    t.cameraOffset.setTo(200, 500);

    game.add.tween(logo2.cameraOffset).to( { y: 400 }, 2000, Phaser.Easing.Back.InOut, true, 0, 2000, true);

    cursors = game.input.keyboard.createCursorKeys();
    
    towerButton.makeButtons();

}

function update() {

    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);

}