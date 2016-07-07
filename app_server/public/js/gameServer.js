class gameServer {
    constructor() {
        var host = window.document.location.host.replace(/:.*/, '');
        this.ws = new WebSocket('ws://' + host + ':8081');
        this.ws.onopen = (e) => this.initialSync(e);
        this.ws.onmessage = (e) => this.serverMessage(e);

        game.units.onUnitKilled = (id) => this.destroyTower(id);
    }

    // send any init info to the server on start
    initialSync(event) {
        this.ws.send(JSON.stringify({
            event: 'initsyncClient',
            playerType: game.player.type,
            // send player's id
            playerID: game.player.id,
            playerClr: game.player.clr,
            playerClrName: game.player.clrName
        }));
    };

    //this event happens whenever new game data comes down from the server
    serverMessage(event) {
        var data = JSON.parse(event.data);
        //var blobPosition = new Victor(data.x, data.y);
        //gameBoardLayer.drawRandomBlob(data.x, data.y, 10);

        // this is part of the initial sync, when the server sends init data to the client
        if (data.event === 'initsyncServer') {
            // server response to initialsyncClient

            // draw map
            game.terrainRenderTexture.renderTerrainTexture(data.terrainMap);

            // set player color
            game.player.clr = data.playerClr;
            game.player.clrName = data.playerClrName;
            // save players for the game session
            game.players.setPlayers(data.players);
            //set the player's id (the server could have changed it);
            game.player.id = data.playerID;
            document.cookie = 'pid=' + game.player.id + ';';
            // display the towers that existed before the client connected
            data.units.forEach((e, i) => {
                // create a sprite to represent each tower from the server
                game.units.newTower(e.x, e.y, e.id, e.ownerId, e.type);
            });
        } else if (data.event === 'scheduleEvents') {
            game.eventQueue.queueEvents(data.schedule);
        } else if (data.event === 'sync-addUnit') {
            console.log(data);
            game.units.newTower(data.unit.x, data.unit.y, data.unit.id, data.unit.ownerId, data.unit.type);
        }
    }

    createTower(x, y, type, owner) {
        this.ws.send(JSON.stringify({
            event: 'new tower',
            x: x,
            y: y,
            type: type,
            owner: owner
        }));
    }
    destroyTower(id) {
        this.ws.send(JSON.stringify({
            event: 'destroy tower',
            id: id,
        }));
    }
    sendCensusData(tiles) {
        this.ws.send(JSON.stringify({
            event: 'census vote',
            votes: tiles,
        }));
    }
    manualSplatter(x, y, radius, owner) {
        this.ws.send(JSON.stringify({
            event: 'manual splatter',
            x: x,
            y: y,
            radius: radius,
            owner: owner
        }));
    }
    moveHero(x, y) {
        this.ws.send(JSON.stringify({
            event: 'tower destination',
            id: 1,
            x: x,
            y: y,
        }));
    }

}