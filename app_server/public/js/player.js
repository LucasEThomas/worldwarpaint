"use strict";

class Player {
    constructor(type, id) {
        this.id = id || Math.generateUUID();
        this.clr = {};
        this.clrName = '';
        this.type = type;
    }
}
class PlayersManager {
    constructor() {
        this.players = [];
    }
    setPlayers(players) {
        this.players.push(...players);
    }
	addPlayer(player) {
        this.players.push(player);
    }
    // given a player id, return the player's color {r,g,b} object
    getClr(id) {
        let player = this.players.find((player) => player.id === id);
        if (player) {
            return player.clr;
        } else {
            console.error('player with id ' + id + ' not found.');
            return {r:0.0, g:0.0, b:0.0};
        }
    }
    getClrHex(id){
        let {r, g, b} = this.getClr(id)
        return Utility.rgbToHex(r,g,b)
    }
    getClrName(id) {
        let player = this.players.find((player) => player.id === id);
        if (player) {
            return player.clrName;
        } else {
            console.error('player with id ' + id + ' not found.');
            return {r:0.0, g:0.0, b:0.0};
        }
    }
}