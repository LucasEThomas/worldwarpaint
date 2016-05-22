var abilities = [
    {
        name: 'new tower',
        cost: 0,
        image: 'blueButton1',
        usageCallback: undefined,
        onClickOptions: {
            cost: 45,
            imageName: 'tower',
            alpha: 0.6,
            inIsoUnitsGroup: true,
            snap: 32,
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