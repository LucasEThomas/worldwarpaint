var abilities = [
    {
        name: 'new tower',
        image: 'blueButton1',
        usageCallback: undefined,
        onClickOptions: {
            imageName: 'tower',
            alpha: 0.6,
            inIsoUnitsGroup: true,
            snap: 23,
            mustColorMatch: true,
            onClickCallback: function(x, y) {
                game.gameServer.createTower(x, y, 'sprinklerTower', game.player.id);
            }
        }
    }
];

//imageName,            //the cursor image changes to this after selecting the ability
//alpha,                //alpha of the cursor image
//onClickCallback,      //what happens after user clicks having selected the ability
//inIsoUnitsGroup,      //whether you want it to iso sort behind other units
//snap,                 //how much to snap the cursor image to the world coordinates
//mustColorMatch        //whether the ability can only happen on the player's color