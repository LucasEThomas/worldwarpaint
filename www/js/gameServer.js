gameServer = function() {

}

gameServer.ws = null;

// check if cookie exists with player id
if (Utility.getCookie('pid') !== '') {
    // cookie exists, so set the player id to match the cookie info
    player.id = Utility.getCookie('pid');
} else {
    // the cookie doesn't exist, so create one with a generated player id
    document.cookie = 'pid=' + player.id + ';';
}

//connects to the websocket game server
gameServer.initialize = function() {
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
        // send player's id
        playerID: player.id
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
        // set player color
        player.clr = data.playerClr;
        // save players for the game session
        players = data.players;
        // save towers for the game session
        towers = data.towers;
        // display the towers that existed before the client connected
        towers.forEach(function(e, i) {
            // create a sprite to represent each tower from the server
            var tower = game.add.sprite(e.x, e.y, 'towerBlue' + e.type);
            // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
            tower.anchor.setTo(0.5, 0.5);
        });
    } else if (data.event === 'sprinkle') {
        //console.log('msg-rxd: tower sprinkles');
        // sprinkle data received from the server
        // iterate through the sprinkle array
        for (var i = 0; i < data.sprinkles.length; i += 1) {
            var s = data.sprinkles[i].sprinkles;
            // get the owner of the sprinkle so we can get their color
            var owner = data.sprinkles[i].ownerID;
            // draw the sprinkle
            gameBoardLayer.drawSprinkle(s[0], s[1], 3, getPlayerClr(owner));
        }
    } else if (data.event === 'sync-addTower') {
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