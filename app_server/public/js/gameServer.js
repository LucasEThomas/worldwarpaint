class gameServer {
    constructor() {
        var host = window.document.location.host.replace(/:.*/, '');
        this.ws = new WebSocket('ws://' + host + ':8081');
        this.ws.onopen = (e) => this.initialSync(e);
        this.ws.onmessage = (e) => this.serverMessage(e);
    }

    // send any init info to the server on start
    initialSync(event) {
        this.ws.send(JSON.stringify({
            event: 'initsyncClient',
            playerType: game.player.type,
            // send player's id
            playerID: game.player.id,
            playerClr: game.player.clr
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
            // save players for the game session
            game.players = data.players;
            //set the player's id (the server could have changed it);
            game.player.id = data.playerID;
            document.cookie = 'pid=' + game.player.id + ';';
            // display the towers that existed before the client connected
            data.units.forEach(function(e, i) {
                // create a sprite to represent each tower from the server
                var tower = game.add.isoSprite(e.x, e.y, 0, 'tower', 0, game.unitsGroup);
                tower.id = e.id;
                // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
                tower.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));
                tower.ownerID = e.ownerID;
                tower.type = e.type;
                towers.push(tower);
            });
        } else if (data.event === 'scheduleEvents') {
            //A new list of events has come down from the server. Each one needs to scheduled in the eventQueue.
            var currentTime = (new Date()).getTime();
            for (var i = 0; i < data.schedule.length; i += 1) {
                var currentScheduleItem = data.schedule[i];
                currentScheduleItem.scheduledTime = currentTime + (i * 50);
                game.eventQueue.push(currentScheduleItem)
            }
        } else if (data.event === 'sync-addUnit') {
            var tower = game.add.isoSprite(data.unit.x, data.unit.y, 0, 'tower', 0, game.unitsGroup);
            tower.id = data.unit.id;
            // if you don't set the anchor the sprite won't show on the map correctly (will be offset)
            tower.anchor.setTo(0.5, 0.84); //1-((tower.width/4)/tower.height));
            tower.ownerID = data.unit.ownerID;
            tower.type = data.unit.type;
            towers.push(tower);
        }
    }

    createTower(x, y, type, id, owner) {
        this.ws.send(JSON.stringify({
            event: 'new tower',
            x: x,
            y: y,
            type: type,
            id: id,
            owner: owner
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