"use strict";
var Utility = require('../Utility.js');

class Player {
    constructor(id, ws, clr) {
        this.ws = ws;
        this.id = id;
        this.clr = clr;
    }
    scheduleEvents(schedule) {
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    event: 'scheduleEvents',
                    schedule: schedule
                }), function() { /* ignore errors */ });
            }
        }
        // creates a dictionary for sending player info to the client
    toJSON() {
        return {
            id: this.id,
            clr: this.clr
        };
    }
}

module.exports = Player;