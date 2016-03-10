"use strict";
var Utility = require('./Utility.js');
var Player = require('./Player.js');
var uuid = require('node-uuid');

class Room {
    constructor(id, onPlayerChangeRoom) {
        this.id = id;
        this.players = [
            (new Player()).setPlayerData({id: 1, name: 'Bob', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 2, name: 'Joshua', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 3, name: 'Diego', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 4, name: 'Carissa', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 5, name: 'Kayden', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 6, name: 'Larry', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 7, name: 'Francis', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 8, name: 'George', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 9, name: 'Electra', clr: '#4186EF', type: 'Commander', ready: false}),
            (new Player()).setPlayerData({id: 10, name: 'Eleazar', clr: '#4186EF', type: 'Commander', ready: false}),
        ];
        this.onPlayerChangeRoom = onPlayerChangeRoom;
        
        setInterval(()=>{
            let currentPlayer = this.players[Math.rangeInt(0,9)];
            currentPlayer.ready = this.coinFlip();
            currentPlayer.clr = this.pickRandomColor();
            currentPlayer.type = this.pickRandomType();
            this.pushUpdatedPlayer(currentPlayer);
        }, 1000);
        
    }
    addNewPlayer(ws){
        // make a unique uuid
        var id = uuid.v4();
        
        var onUpdate = (player) => {
            pushUpdatedPlayer(player);
        };
        
        var onChangeRoom = (newRoomId) => {
            this.changePlayerRoom(ws, newRoomId);
        };
        
        var onDisconnect = (player) => {
            this.playerDisconnected(player.id);
            console.log('client disconnected');
            console.log(this.players);
        };
        
        var newPlayer = new Player(id, ws, onUpdate, onChangeRoom, onDisconnect);
        this.players.push(newPlayer);
        newPlayer.sendMultiPlayersData(this.buildMultiPlayersData());
        console.log('client connected');
        console.log(this.players);
    }
    pushUpdatedPlayer(updatedPlayer){
        //iterate through all players and tell them to send the new data through their sockets
        this.players.forEach((currentPlayer,index)=>{
            currentPlayer.sendPlayerData(updatedPlayer.toJSON());
        });
    }
    changePlayerRoom(ws, newRoomId){
        this.onPlayerChangeRoom(ws, newRoomId);
        //remove player from array
        this.players = this.players.filter(function(v) {
            return v.id !== playerId;
        });
    }
    playerDisconnected(playerId){
        //remove player from array
        this.players = this.players.filter(function(v) {
            return v.id !== playerId;
        });
    }
    buildMultiPlayersData(){
        var toReturn = [];
        this.players.forEach((currentPlayer, index)=>{
            if(currentPlayer.name){
                toReturn.push(currentPlayer.toJSON());
            }
        });
        return toReturn;
    }
    
    convertColorNameToColor(name){
        var colorsDict = {
            blue: '#4186EF', 
            teal: '#57C5B8', 
            white: '#3C3042',
            yellow: '#ECC82F',
            orange: '#F28B31', 
            red: '#EB4D4D', 
            magenta: '#EC53AC', 
            violet: '#9950B4'
        };
        return colorsDict[name];
    }
    pickRandomColor(){
        var colors = ['blue', 'teal', 'white', 'yellow', 'orange', 'red', 'magenta', 'violet'];
        var chosenColor = colors[Math.rangeInt(0,colors.length-1)];
        return this.convertColorNameToColor(chosenColor);
    }
    pickRandomType(){
        var types = ['Commander','Engineer','Champion','Archer'];
        return types[Math.rangeInt(0,types.length-1)];
    }
    coinFlip(){
        return (Math.rangeInt(0,1)===1)?true:false;
    }
}

module.exports = Room;