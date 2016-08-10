"use strict";
//http stuff
var request = require('request');
var express = require('express');
var app = express();
//ws stuff
var Utility = require('./Utility.js');
var Room = require('./Room.js');
var WebSocketServer = require('ws').Server;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/worldwarpaint');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});

var playerSchema = mongoose.Schema({
    id: String,
    name: String,
    color: String,
});

var roomSchema = mongoose.Schema({
    name: String,
    uniqueUrl: String,
    appServerUrl: String,
    gameServerUrl: String,
    private: Boolean,
    players: [playerSchema]
});

var Room = mongoose.model('Room', RoomSchema);

var onlyRoom = new Room({
    name: 'only room',
    uniqueUrl: 'onlyroom',
    appServerUrl: 'localhost:8080',
    gameServerUrl: 'localhost:8081',
    players: []
});

//http stuff
app.use(express.static(__dirname + '/public'));

app.get('/externalip', function(req, res) {
    getExternalIp((body) => {
        //console.log(body);
        res.send(body);
    });
});

app.listen(8080);

//ws stuff
var rooms = [];
rooms[0] = new Room(onlyRoom); //for now just one room

var wss = new WebSocketServer({
    port: 8181
});
wss.on('connection', function connection(ws) {
    rooms[0].addNewPlayer(ws);
});

// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.
var METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/' +
    '/instance/network-interfaces/0/access-configs/0/external-ip';

function getExternalIp(cb) {
    var options = {
        url: METADATA_NETWORK_INTERFACE_URL,
        headers: {
            'Metadata-Flavor': 'Google'
        }
    };

    request(options, function(err, resp, body) {
        if (err || resp.statusCode !== 200 || !/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(body)) {

            console.log('Error while talking to metadata server, assuming localhost');
            return cb('localhost');
        }
        return cb(body);
    });
}