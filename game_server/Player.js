"use strict";

class Player {
    constructor(id, ws, clr, onInitSync, onDisconnect, onNewTower, onManualSplatter, onUnitDestination) {
        this.ws = ws;
        this.id = id;
        this.clr = clr;
        
        this.onInitSync = onInitSync;
        this.onDisconnect = onDisconnect;
        this.onNewTower = onNewTower;
        this.onManualSplatter = onManualSplatter;
        this.onUnitDestination = onUnitDestination;
        
        ws.on('close', function() {
            this.onDisconnect(this);
        });
        ws.on('message', function(data, flags) {
            this.messageRxvd(JSON.parse(data));
        });
    }
    
    messageRxvd(data){
        if (data.event === 'initsyncClient') {
            this.onInitSync(this);
        } else if (data.event === 'new tower') {
            this.onNewTower(this, data.x, data.y, data.type, data.owner);
        } else  if (data.event === 'manual splatter') {
            this.onManualSplatter(this, data.x, data.y, data.radius, data.owner);
        } else  if (data.event === 'unit destination') {
            this.onUnitDestination(this, data.id, data.x, data.y);
        } 
    }
    
    initSyncServer(players, units){
        ws.send(JSON.stringify({
            event: 'initsyncServer',
            playerClr: this.clr,
            playerID: this.id,
            players: players,
            units: units
        }), function() { /* ignore errors */ });
    }
    addUnit(unit){
        this.ws.send(JSON.stringify({
            event: 'sync-addUnit',
            unit: unit
        }));
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