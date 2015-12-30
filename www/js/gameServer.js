gameServer = function() {

}

gameServer.ws = null;

//connects to the websocket game server
gameServer.initialize = function() {
    var host = window.document.location.host.replace(/:.*/, '');
    ws = new WebSocket('ws://' + host + ':8081');
    ws.onmessage = gameServer.serverMessage;
}

//this event happens whenever new game data comes down from the server
gameServer.serverMessage = function(event) {
    data = JSON.parse(event.data);
    //var blobPosition = new Victor(data.x, data.y);
    //gameBoardLayer.drawRandomBlob(data.x, data.y, 10);
    for (var i = 0; i < data.sprinkles.length; i += 2) {
        gameBoardLayer.drawSprinkle(data.sprinkles[i], data.sprinkles[i + 1], 3);
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