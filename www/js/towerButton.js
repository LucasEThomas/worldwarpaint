towerButton = function (){
    
}

towerButton.makeButtons = function (){

var towerButton1
var towerButton2
var towerButton3
var towerButton4

towerButton1 = game.add.sprite(0, 0, 'blueButton1');
towerButton1.fixedToCamera = true;
towerButton1.cameraOffset.setTo(10, 150);
    
towerButton2 = game.add.sprite(0, 0, 'blueButton2');
towerButton2.fixedToCamera = true;
towerButton2.cameraOffset.setTo(10, 210);
    
towerButton3 = game.add.sprite(0, 0, 'blueButton3');
towerButton3.fixedToCamera = true;
towerButton3.cameraOffset.setTo(10, 270);
    
towerButton4 = game.add.sprite(0, 0, 'blueButton4');
towerButton4.fixedToCamera = true;
towerButton4.cameraOffset.setTo(10, 330);
    
}