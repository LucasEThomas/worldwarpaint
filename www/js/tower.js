tower = function(){
    
}

var towerDrag;
var towers = [];


tower.dragTower = function()
{ 
    towerDrag = game.add.sprite(0,0, 'towerBlue'+selectedTower);
    towerDrag.inputEnabled = false;
    towerDrag.anchor.setTo(0.5,0.5);
    towerDrag.events.onInputDown.add(this.towerPlaced);   
}

tower.dragCord = function()
{
    towerDrag.position.x = game.input.worldX;
    towerDrag.position.y = game.input.worldY;
}

tower.towerPlaced = function()
{
    
    if (selectedTower === 1)
    {
    var tower = game.add.sprite(game.input.worldX,game.input.worldY, 'towerBlue'+selectedTower);
    tower.inputEnabled = true;
    tower.anchor.setTo(0.5,0.5);
    tower.health = 100;
    tower.type = 'normal';  
    towers.push (tower);   
    }
    else if (selectedTower === 2)
        {
    var tower = game.add.sprite(game.input.worldX,game.input.worldY, 'towerBlue'+selectedTower);
    tower.inputEnabled = true;
    tower.anchor.setTo(0.5,0.5);
    tower.health = 100;
    tower.type = 'smiley';  
    towers.push (tower);   
        }
    else if (selectedTower === 3)
        {
    var tower = game.add.sprite(game.input.worldX,game.input.worldY, 'towerBlue'+selectedTower);
    tower.inputEnabled = true;
    tower.anchor.setTo(0.5,0.5);
    tower.health = 100;
    tower.type = 'dots';  
    towers.push (tower);   
        }
    else if (selectedTower === 4)
        {
    var tower = game.add.sprite(game.input.worldX,game.input.worldY, 'towerBlue'+selectedTower);
    tower.inputEnabled = true;
    tower.anchor.setTo(0.5,0.5);
    tower.health = 100;
    tower.type = 'stripes';  
    towers.push (tower);   
        }
    towerDrag.destroy();
}