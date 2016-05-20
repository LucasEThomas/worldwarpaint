"use strict";

class Player {
    constructor(id, ws, clrName, clr, onInitSync, onDisconnect, onNewTower, onManualSplatter, onUnitDestination) {
        this.ws = ws;
        this.id = id;
        this.clr = clr;
        this.clrName = clrName;

        this.onInitSync = onInitSync;
        this.onDisconnect = onDisconnect;
        this.onNewTower = onNewTower;
        this.onManualSplatter = onManualSplatter;
        this.onUnitDestination = onUnitDestination;

        if (ws) {
            ws.on('close', ()=>{
                this.onDisconnect(this);
                this.ws = null;
            });
            ws.on('message', (data, flags)=>{
                this.messageRxvd(JSON.parse(data));
            });
        }
    }

    messageRxvd(data) {
        if (data.event === 'initsyncClient') {
            this.onInitSync(this, data);
        } else if (data.event === 'new tower') {
            this.onNewTower(this, data.x, data.y, data.type, data.owner);
        } else if (data.event === 'manual splatter') {
            this.onManualSplatter(this, data.x, data.y, data.radius, data.owner);
        } else if (data.event === 'unit destination') {
            this.onUnitDestination(this, data.id, data.x, data.y);
        }
    }

    initSyncServer(players, units, map) {
        this.wsSend({
            event: 'initsyncServer',
            playerClr: this.clr,
            playerID: this.id,
            players: players,
            units: units,
            terrainMap: map.terrainMap
            //objectMap: map.objectMap // houses, trees, etc (anything with depth)
        });
    }
    addUnit(unit) {
        this.wsSend({
            event: 'sync-addUnit',
            unit: unit
        });
    }
    scheduleEvents(schedule) {
        this.wsSend({
            event: 'scheduleEvents',
            schedule: schedule
        });
    }
    // creates a dictionary for sending player info to the client
    toJSON() {
        return {
            id: this.id,
            clr: this.clr,
            clrName: this.clrName
        };
    }
    wsSend(data){
        if(this.ws && this.ws.readyState == this.ws.OPEN){
            this.ws.send(JSON.stringify(data));
        }
    }
}

module.exports = Player;