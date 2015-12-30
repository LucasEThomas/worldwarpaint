tower = function () {

}

var towerDrag;
var towers = [];


tower.dragTower = function () {
    towerDrag = game.add.sprite(0, 0, 'towerBlue' + selectedTower);
    towerDrag.inputEnabled = false;
    towerDrag.anchor.setTo(0.5, 0.5);
    towerDrag.events.onInputDown.add(this.towerPlaced);
}

tower.dragCord = function () {
    towerDrag.position.x = game.input.worldX;
    towerDrag.position.y = game.input.worldY;
}

tower.towerPlaced = function () {
    // create a Phaser sprite object for a new tower
    var tower = game.add.sprite(game.input.worldX, game.input.worldY, 'towerBlue' + selectedTower);

    // enable input so we can detect when the mouse is clicked while dragging the sprite
    tower.inputEnabled = true;

    // have the sprite centered on the mouse
    tower.anchor.setTo(0.5, 0.5);

    // this will be changed in the future
    tower.health = 100;

    // generate a UUID for the tower
    tower.id = Math.generateUUID();

    // add the tower object to an array we can reference later
    towers.push(tower);

    // tell the server we created a new tower
    gameServer.createTower(game.input.worldX, game.input.worldY, selectedTower, tower.id);

    // stop dragging a new tower
    towerDrag.destroy();
    towerDrag = null;
}