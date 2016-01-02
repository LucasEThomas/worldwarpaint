gameServer = function() {

}

gameServer.ws = null;

if (Utility.getCookie('pid') !== '') {
    player.id = Utility.getCookie('pid');
} else {
    document.cookie = 'pid=' + player.id + ';';
}

//connects to the websocket game server
gameServer.initialize = function() {
    var host = window.document.location.host.replace(/:.*/, '');
    ws = new WebSocket('ws://' + host + ':8081');
    ws.onmessage = gameServer.serverMessage;
    ws.onopen = gameServer.initialSync;
}

gameServer.initialSync = function(event) {
    console.log('initsyncClient');
    ws.send(JSON.stringify({
        event: 'initsyncClient',
        // send player's id
        playerID: player.id
    }));
};

//this event happens whenever new game data comes down from the server
gameServer.serverMessage = function(event) {
    data = JSON.parse(event.data);
    //var blobPosition = new Victor(data.x, data.y);
    //gameBoardLayer.drawRandomBlob(data.x, data.y, 10);
    if (data.event === 'initsyncServer') {
        // server response to initial sync
        // set player color
        player.clr = data.playerClr;
        console.log('initsyncServer');
    } else if (data.event === 'sprinkle') {
        console.log('sprinkle');
        for (var i = 0; i < data.sprinkles.length; i += 2) {
            gameBoardLayer.drawSprinkle(data.sprinkles[i], data.sprinkles[i + 1], 3);
        }
    }
}

gameServer.createTower = function(x, y, type, id) {
    ws.send(JSON.stringify({
        event: 'new tower',
        x: x,
        y: y,
        type: type,
        id: id
    }));
}