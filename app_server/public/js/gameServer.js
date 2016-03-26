gameServer = function() {

}

gameServer.ws = null;

//connects to the websocket game server
gameServer.initialize = function() {
    // check if cookie exists with player id
    if (Utility.getCookie('pid') !== '') {
        // cookie exists, so set the player id to match the cookie info
        player.id = Utility.getCookie('pid');
    } else {
        // the cookie doesn't exist, so create one with a generated player id
        document.cookie = 'pid=' + player.id + ';';
    }

    var host = window.document.location.host.replace(/:.*/, '');
    ws = new WebSocket('ws://' + host + ':8081');
    ws.onmessage = gameServer.serverMessage;
    // when the ws connection is opened, call the initialSync method
    ws.onopen = gameServer.initialSync;
}

// send any init info to the server on start
gameServer.initialSync = function(event) {
    console.log('initsyncClient');
    ws.send(JSON.stringify({
        event: 'initsyncClient',
        playerType: player.type,
        // send player's id
        playerID: player.id,
        playerClr: player.clr
    }));
};

// holds the players for this client's session
var players = [];
// holds the towers for this client's session
var towers = [];

// given a player id, return the player's color dictionary
var getPlayerClr = function(id) {
    for (var key in players) {
        if (players[key].id === id) {
            return players[key].clr;
        }
    }
    console.log('player not found!')
    return {
        r: 1.0,
        g: 1.0,
        b: 1.0
    };

}

//this event happens whenever new game data comes down from the server
gameServer.serverMessage = function(event) {
    data = JSON.parse(event.data);
    //var blobPosition = new Victor(data.x, data.y);
    //gameBoardLayer.drawRandomBlob(data.x, data.y, 10);

    // this is part of the initial sync, when the server sends init data to the client
    if (data.event === 'initsyncServer') {
        console.log('msg-rxd: initsyncServer');
        // server response to initialsyncClient

        // create map
        console.table(data.terrainMap);
        map.renderTerrainTexture(data.terrainMap);
        gameBoardLayer.initialize();
        unitsGroup = game.add.group();
        game.iso.topologicalSort(unitsGroup);

        // set player color
        player.clr = data.playerClr;
        // save players for the game session
        players = data.players;
        //set the player's id (the server could have changed it);
        player.id = data.playerID;
        document.cookie = 'pid=' + player.id + ';';
        // display the towers that existed before the client connected
        data.units.forEach(function(e, i) {
            // create a sprite to represent each tower from the server
            var tower = game.add.isoSprite(e.x, e.y, 0, 'tower', 0, unitsGroup);
            tower.id = e.id;
            // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
            tower.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));
            tower.ownerID = e.ownerID;
            tower.type = e.type;
            towers.push(tower);
        });
    } else if (data.event === 'scheduleEvents') {
        //A new list of events has come down from the server. Each one needs to scheduled in the eventQueue.
        var currentTime = (new Date()).getTime();
        for (var i = 0; i < data.schedule.length; i += 1) {
            var currentScheduleItem = data.schedule[i];
            currentScheduleItem.scheduledTime = currentTime + (i * 50);
            eventQueue.push(currentScheduleItem)
        }
    } else if (data.event === 'sync-addUnit') {
        //console.log('msg-rxd: '+data.event);
        var tower = game.add.sprite(data.tower.x, data.tower.y, 'towerBlue' + data.tower.type);
        tower.anchor.setTo(0.5, 0.5);
    }
}

gameServer.createTower = function(x, y, type, id, owner) {
    ws.send(JSON.stringify({
        event: 'new tower',
        x: x,
        y: y,
        type: type,
        id: id,
        owner: owner
    }));
}
gameServer.manualSplatter = function(x, y, radius, owner) {
    ws.send(JSON.stringify({
        event: 'manual splatter',
        x: x,
        y: y,
        radius: radius,
        owner: owner
    }));
}
gameServer.moveHero = function(x, y) {
    ws.send(JSON.stringify({
        event: 'tower destination',
        id: 1,
        x: x,
        y: y,
    }));
}