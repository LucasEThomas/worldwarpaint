"use strict";

class Player {
    constructor(id, ws, onUpdate, onJoinRoom, onLeaveRoom, onCreateRoom, onDisconnect) {
        this.ws = ws;
        this.onUpdate = onUpdate;
        this.onJoinRoom = onJoinRoom;
        this.onLeaveRoom = onLeaveRoom;
        this.onCreateRoom = onCreateRoom;
        this.onDisconnect = onDisconnect;

        this.id = id;
        this.name;
        this.clr;
        this.type;
        this.ready = false;

        if (ws) {
            ws.on('close', () => {
                this.onDisconnect(this);
            });

            ws.on('message', (data, flags) => {
                this.messageRxvd(JSON.parse(data));
            });
        }
    }

    messageRxvd(data) {
        if (data.event === 'setPlayerData') {
            this.setPlayerData(data);
            this.onUpdate(this);
        } else if (data.event === 'leaveRoom') {
            this.onLeaveRoom(this);
        } else if (data.event === 'joinRoom') {
            this.onJoinRoom(this, data.roomId);
        } else if (data.event === 'createRoom') {
            this.onCreateRoom(this, data.roomId);
        }
    }
    setPlayerData(data) {
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