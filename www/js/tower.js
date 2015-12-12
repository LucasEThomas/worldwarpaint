tower = function(){
    
}

var towerDrag

tower.dragTower = function(){
    
    towerDrag = game.add.sprite(0,0, 'towerBlue'+selectedTower);
    towerDrag.inputEnabled = true;
    towerDrag.anchor.setTo(0.5,0.5);
    towerDrag.events.onInputDown.add(tower.towerPlaced);
    
}

tower.dragCord = function(){
    
    towerDrag.position.x = game.input.worldX;
    towerDrag.position.y = game.input.worldY;
    
}

tower.towerPlaced = function(){
    
    
    
}