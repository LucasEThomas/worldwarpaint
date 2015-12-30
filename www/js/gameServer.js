gameServer = function () {

}

gameServer.ws = null;

//connects to the websocket game server
gameServer.initialize = function () {
    var host = window.document.location.host.replace(/:.*/, '');
    ws = new WebSocket('ws://' + host + ':8081');
    ws.onmessage = gameServer.downlinkEvent;
}

//this event happens whenever new game data comes down from the server
gameServer.downlinkEvent = function (event) {
    data = JSON.parse(event.data);
    //var blobPosition = new Victor(data.x, data.y);
    gameBoardLayer.drawRandomBlob(data.x, data.y, 10);
}

gameServer.createTower = function (x, y, type, id) {
    ws.send(JSON.stringify({
        event: 'new tower',
        x: x,
        y: y,
        type: type,
        id: id
    }));
}