towerButton = function ()
{
    
}

var towerButton1
var towerButton2
var towerButton3
var towerButton4
var selectedTower

towerButton.makeButtons = function (){

towerButton1 = game.add.sprite(0, 0, 'blueButton1');
towerButton1.fixedToCamera = true;
towerButton1.cameraOffset.setTo(30, 150);
towerButton1.anchor.setTo(0.5,0.5);
towerButton1.inputEnabled = true;
towerButton1.events.onInputDown.add(this.selectTower1);
    
towerButton2 = game.add.sprite(0, 0, 'blueButton2');
towerButton2.fixedToCamera = true;
towerButton2.cameraOffset.setTo(30, 210);
towerButton2.anchor.setTo(0.5,0.5);
towerButton2.inputEnabled = true;
towerButton2.events.onInputDown.add(this.selectTower2);
    
towerButton3 = game.add.sprite(0, 0, 'blueButton3');
towerButton3.fixedToCamera = true;
towerButton3.cameraOffset.setTo(30, 270);
towerButton3.anchor.setTo(0.5,0.5);
towerButton3.inputEnabled = true;
towerButton3.events.onInputDown.add(this.selectTower3);
    
towerButton4 = game.add.sprite(0, 0, 'blueButton4');
towerButton4.fixedToCamera = true;
towerButton4.cameraOffset.setTo(30, 330);
towerButton4.anchor.setTo(0.5,0.5);
towerButton4.inputEnabled = true;
towerButton4.events.onInputDown.add(this.selectTower4);
    
}

towerButton.selectTower1 = function()
{   
    selectedTower = 1;
    tower.dragTower();
}

towerButton.selectTower2 = function()
{   
    selectedTower = 2;
    tower.dragTower();
}

towerButton.selectTower3 = function()
{   
    selectedTower = 3;
    tower.dragTower();
}

towerButton.selectTower4 = function()
{   
    selectedTower = 4;
    tower.dragTower();
}