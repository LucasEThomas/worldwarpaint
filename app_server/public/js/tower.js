var tower = function(){
    
};

//class tower extends Phaser.sprite{
//    contructor(){
//        
//    }
//}

var towerDrag;
var towers = [];


tower.dragTower = function () {
    towerDrag = game.add.isoSprite(0, 0, 0, 'tower' ,0 , game.unitsGroup);
    towerDrag.inputEnabled = false;
    towerDrag.anchor.setTo(0.5, 0.84);
    //towerDrag.snap = 46;
    towerDrag.alpha = 0.6;
}

tower.dragCord = function () {
    var point = game.iso.unproject(game.input.activePointer.position);
    
    towerDrag.isoX = point.x - (point.x % 92);
    towerDrag.isoY = point.y - (point.y % 92);
}

tower.towerPlaced = function (placeX, placeY) {
    // create a Phaser sprite object for a new tower
    
    // grab the xy coords
//    var tower = game.add.isoSprite(placeX, placeY, 0, 'tower' ,0 ,game.unitsGroup);
//
//    // enable input so we can detect when the mouse is clicked while dragging the sprite
//    tower.inputEnabled = true;
//
//    // have the sprite centered on the mouse
//    console.log(tower.width);
//    tower.anchor.setTo(0.5, 0.84);
//
//    // this will be changed in the future
//    tower.health = 100;
//
//    // generate a UUID for the tower
//    tower.id = Math.generateUUID();
//
//    // add the tower object to an array we can reference later
//    towers.push(tower);

    // tell the server we created a new tower
    game.gameServer.createTower(placeX, placeY, selectedTower, tower.id, game.player.id);

    // stop dragging a new tower
    towerDrag.destroy();
    towerDrag = null;
}