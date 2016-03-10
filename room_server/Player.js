"use strict";

class Player {
    constructor(id, ws, onUpdate, onChangeRoom, onDisconnect) {
        this.ws = ws;
        this.onUpdate = onUpdate;
        this.onChangeRoom = onChangeRoom;
        this.onDisconnect = onDisconnect;
        
        this.id = id;
        this.name;
        this.clr;
        this.type;
        this.ready = false;
        
        if(ws){
            ws.on('close', ()=>{
                this.onDisconnect(this);
            });

            ws.on('message', (data, flags)=>{
                this.messageRxvd(JSON.parse(data));
            });
        }
    }
    
    messageRxvd(data){
        if (data.event === 'setPlayerData') {
            this.setPlayerData(data);
            this.onUpdate(this);
        } else if(data.event === 'changeRoom'){
            this.onChangeRoom(this, data.newRoomId);
        }
    }
    setPlayerData(data){
        this.id = data.id;
        this.name = data.name;
        this.clr = data.clr;
        this.type = data.type;
        this.ready = data.ready;
        return this;
    }
    sendPlayerData(data) {
        if (this.ws) {
            this.ws.send(JSON.stringify({
                event: 'setPlayerData',
                player: data
            }), function() { /* ignore errors */ });
        }
    }
    sendMultiPlayersData(data) {
        if (this.ws) {
            this.ws.send(JSON.stringify({
                event: 'setMutliPlayersData',
                players: data
            }), function() { /* ignore errors */ });
        }
    }
    // creates a stringifiable version of this object
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            clr: this.clr,
            type: this.type,
            ready: this.ready,
        };
    }
}

module.exports = Player;