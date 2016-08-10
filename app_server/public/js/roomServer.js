angular.module('services.roomServer', []).factory('roomServer', ['$rootScope', function($rootScope) {
    // We return this object to anything injecting our service
    var service = {};
    // Create our websocket object with the address to the websocket
    var host = window.document.location.host.replace(/:.*/, '');
    service.ws = {};


    //here, we set the player into the array pattern that the angular controller understands
    function setPlayer(player) {

        $rootScope.$apply(() => {
            //remove all instances of the player (there should never be more than one)
            $rootScope.teams.forEach((currentTeam, index) => {
                currentTeam.players = currentTeam.players.filter((currentPlayer) => currentPlayer.id !== player.id);
            });
            //find the team of the player's color
            var playersTeam = $rootScope.teams.find((d) => d.clr === player.clr);
            //if there is no team of the player's color, create it
            if (!playersTeam) {
                playersTeam = {
                    players: [],
                    clr: player.clr
                }
                $rootScope.teams.push(playersTeam);
            }
            //add the player to its team
            playersTeam.players.push({
                id: player.id,
                name: player.name,
                type: player.type,
                ready: player.ready
            });
            //remove any empty teams
            $rootScope.teams = $rootScope.teams.filter((currentTeam) => currentTeam.players.length > 0);
            //sort teams by color
            var colorsSortOrder = ['#4186EF', '#57C5B8', '#3C3042', '#ECC82F', '#F28B31', '#EB4D4D', '#EC53AC', '#9950B4'];
            $rootScope.teams.sort((a, b) => colorsSortOrder.indexOf(a.clr) - colorsSortOrder.indexOf(b.clr));
            //calculate totals for display
            $rootScope.numberOfTeams = $rootScope.teams.length;
            $rootScope.numberOfPlayers = ($rootScope.numberOfTeams) ? $rootScope.teams.map((e) => e.players.length).reduce((total, current) => total + current) : 0;

        });
    }

    function setRoom(room) {
        //remove the room
        $rootScope.$apply(() => {
            let index = $rootScope.map((e) => e.id).indexOf('Nick');
        });
    }



    var onopen = function() {
        //        console.log("Room server socket opened!");
    };

    var onmessage = function(message) {
        var data = JSON.parse(message.data);
        if (data.event === 'setPlayerData') {
            setPlayer(data.player);
        } else if (data.event === 'setMutliPlayersData') {
            data.players.forEach((currentPlayer, index) => {
                setPlayer(currentPlayer);
            });
        } else if (data.event === 'setRoomsData') {
            data.rooms.forEach((nRoom, index) => {
                $rootScope.rooms[nRoom.id] = nRoom;
            });
        } else if (data.event === 'setRoomsDataInit') {
            $rootScope.rooms = data.rooms;
        }
    };

    //ajax get the thingy
    $.get('http://' + host + ((host === 'localhost') ? ':8080' : '') + '/externalip', function(data) {
        // Create our websocket object with the address to the websocket
        service.ws = new WebSocket('ws://' + data + ':8181');
        service.ws.onmessage = onmessage;
        service.ws.onopen = onopen;
    });

    service.setPlayerData = function(name, clr, type, ready) {
        console.log('sending!');
        service.ws.send(JSON.stringify({
            event: 'setPlayerData',
            name: name,
            clr: clr,
            type: type,
            ready: ready,
        }));
    }

    return service;
}]);