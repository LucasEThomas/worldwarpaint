class Game extends Phaser.Game {
    constructor(playerType, playerId) {
        super($(window).width(), $(window).height(), Phaser.CANVAS, 'phaser_container', {
            preload: () => this.childPreload(),
            create: () => this.childCreate(),
            update: () => this.childUpdate(),
            render: () => this.childRender()
        });

        this.player = new Player(playerType);

        this.players = new PlayersManager();

        this.eventQueue = [];
    }

    childPreload() {
        let game = this;
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
        game.load.image('tower', 'assets/forestPack/tower1.png');
        game.load.image('robot', 'assets/robot_1.png');
        game.load.image('projectile_red', 'assets/projectileRed.png');
        game.load.image('projectile_blue', 'assets/projectileBlue.png');
        game.load.image('projectile_teal', 'assets/projectileTeal.png');
        game.load.image('projectile_yellow', 'assets/projectileYellow.png');
        game.load.image('projectile_orange', 'assets/projectileOrange.png');
        game.load.image('projectile_magenta', 'assets/projectileMagenta.png');
        game.load.image('projectile_violet', 'assets/projectileViolet.png');
        game.load.image('projectile_white', 'assets/projectileWhite.png');
        game.load.image('towerBlue1', 'assets/TowerBlue1.png');
        game.load.image('towerBlue2', 'assets/TowerBlue2.png');
        game.load.image('towerBlue3', 'assets/TowerBlue3.png');
        game.load.image('towerBlue4', 'assets/TowerBlue4.png');
        game.load.image('notebookPaper', 'assets/isometricNotebookPaper.png');
        game.load.image('splatters', 'assets/splatters.png');
        game.load.image('wildFlowerNoise', 'assets/wildFlowerNoise.png');
        game.load.image('grass1', 'assets/forestPack/grass0x2.png');
        game.load.image('grass2', 'assets/forestPack/grass1x2.png');

        // load game map assets (grass, water, items that don't need depth)
        game.load.image('mGrass0', 'assets/forestPack/grass0x2.png'); // 0
        game.load.image('mGrass1', 'assets/forestPack/grass1x2.png'); // 1
        game.load.image('mWater0', 'assets/forestPack/water0x2.png'); // 2
        game.load.image('mWater1', 'assets/forestPack/water2x2.png'); // 3
        game.load.image('mWater2', 'assets/forestPack/water5x2.png'); // 4
        game.load.image('mWater3', 'assets/forestPack/water3x2.png'); // 5
        game.load.image('mWater4', 'assets/forestPack/water1x2.png'); // 6

        // load game object assets (houses, trees, items that will have a value or needs depth on the map level) 0 is nothing
        game.load.image('mTree0', 'assets/forestPack/tree3x2.png'); // 1
        game.load.image('mTree1', 'assets/forestPack/tree1x2.png'); // 2
        game.load.image('mTree2', 'assets/forestPack/tree2x2.png'); // 3
    }

    childCreate() {
        let game = this;
        //  Modify the world and camera bounds
        game.world.setBounds(0, 0, 3548, 2048);
        $(window).resize(() => {
            this.resizeGame();
        });
        game.camera.y = 200;
        game.camera.x = 1020;

        //create the five visible layers (it matters which order we create these in)
        this.terrainRenderTexture = new Map(game, 3548, 2048, 'terrainBackground'); //  1st Layer, the terrain background
        this.gameBoardLayer = new GameBoardLayer(this); //                              2nd layer, the paint
        this.units = new UnitsManager(); //                                             3rd layer, the game units
        this.gameInputs = new GameInputs(abilities); //                                 4th layer, the gui buttons
        this.money = new moneyManager(); //                                             5th layer, the money

        //initialize the connection with the game server
        // this will trigger the exchange of initial sync data between the server and client
        // the map will be generated/rendered upon receipt of the map data from the server
        this.gameServer = new gameServer(this.player.type);
    }
    childUpdate() {
        //if the  time has come for the next item in the queue to be executed, add it to the render queue
        let game = this;
        var currentTime = (new Date()).getTime();
        if (this.eventQueue.length && this.eventQueue[0].scheduledTime <= currentTime) {
            let currentTimeSlot = this.eventQueue.shift();
            for (var currentEvent of currentTimeSlot) {
                this.units.processEvent(currentEvent);
            }
        }
        //bandaid fix for when the browser looses focus and the eventQueue just piles up. Don't wanna memory leak!
        if (this.eventQueue.length > 10) {
            this.eventQueue.length = 0;
        }

        this.gameInputs.update();
        this.units.update();
        this.money.update();
    }

    childRender() {
        let rect = new Phaser.Rectangle( game.camera.x + (game.camera.width / 2) - 160, game.camera.y + 12, 340, 30 );
        game.debug.geom( rect, 'rgba(55,55,55,1)' );
        game.debug.text('fps:' + (game.time.fps || '--') + ' x:' + game.camera.x + ' y:' + game.camera.y + ' w:' + game.camera.width + ' h:' + game.camera.height, (game.camera.width / 2) - 150, 32);
        this.gameBoardLayer.render();
    }
    resizeGame() {
        let game = this;
        let height = $(window).height();
        let width = $(window).width();

        game.width = width;
        game.height = height;
        game.canvas.width = width;
        game.canvas.height = height;
        game.scale.width = width;
        game.scale.height = height;
        game.camera.setSize(width, height);
        game.renderer.resize(width, height);
    }
}