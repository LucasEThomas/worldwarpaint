"use strict";

class Player {
    constructor(type, id) {
        this.id = id || Math.generateUUID();
        this.clr = {};
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
}