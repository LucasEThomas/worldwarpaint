"use strict";

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
    
    var towers = [];
    
    ws.on('message', function(data, flags) {
        data = JSON.parse(data);
        console.log('event rxd');
        if (data.event === 'new tower') {
            console.log('event: create tower');
            var tower = new Tower(data.x, data.y, data.type);
            towers.push(tower);
            console.log(towers);
        }
    });

});

class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    };
};