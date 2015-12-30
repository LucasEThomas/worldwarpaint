var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8081 });

wss.on('connection', function connection(ws) {
    console.log('new connection');
    
    //every quarter sec create a blob
    var id = setInterval(function() {
        ws.send(JSON.stringify(
            {
                x:Math.random()*500,
                y:Math.random()*500
            }
        ), function() { /* ignore errors */ });
    }, 250);
    
    ws.on('close', function() {
        console.log('stopping client interval');
        clearInterval(id);
    });
    ws.on('new tower', function incoming(message) {
        console.log('received: %s', message);
    });

});