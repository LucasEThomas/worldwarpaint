wwpAngularApp.service('RoomServerService', ['$rootScope', function($scope) {
    // We return this object to anything injecting our service
    var service = {};
    // Create our websocket object with the address to the websocket
    var host = window.document.location.host.replace(/:.*/, '');
    service.ws = {};
    

    //here, we set the player into the array pattern that the angular controller understands
    function setPlayer(player) {
        
        $scope.$apply(() => {
            //remove all instances of the player (there should never be more than one)
            $scope.teams.forEach((currentTeam,index)=>{
                currentTeam.players = currentTeam.players.filter((currentPlayer)=>currentPlayer.id !== player.id);
            });
            //find the team of the player's color
            var playersTeam = $scope.teams.find((d)=>d.clr === player.clr);
            //if there is no team of the player's color, create it
            if(!playersTeam){
                playersTeam = {
                    players:[],
                    clr:player.clr
                }
                $scope.teams.push(playersTeam);
            }
            //add the player to its team
            playersTeam.players.push(
                {id:player.id, name:player.name, type:player.type, ready:player.ready}
            );
            //sort the players in the team by type
            var typeSortOrder = ['Commander', 'Engineer', 'Champion', 'Archer'];
            playersTeam.players.sort((a,b)=>typeSortOrder.indexOf(a.type) - typeSortOrder.indexOf(b.type));
            //remove any empty teams
            $scope.teams = $scope.teams.filter((currentTeam)=>currentTeam.players.length > 0);
            //sort teams by color
            var colorsSortOrder = ['#4186EF', '#57C5B8', '#3C3042', '#ECC82F', '#F28B31', '#EB4D4D', '#EC53AC', '#9950B4'];
            $scope.teams.sort((a,b)=>colorsSortOrder.indexOf(a.clr) - colorsSortOrder.indexOf(b.clr));
            //calculate totals for display
            $scope.numberOfTeams = $scope.teams.length;
            $scope.numberOfPlayers = ($scope.numberOfTeams)?$scope.teams.map((e)=>e.players.length).reduce((total, current)=>total + current):0;
            
        });
    }
    
    var onopen = function(){
        console.log("Room server socket opened!");
    };
    
    var onmessage = function(message) {
        var data = JSON.parse(message.data);
        if(data.event === 'setPlayerData'){
            setPlayer(data.player);
        }
        else if(data.event === 'setMutliPlayersData'){
            console.log('setMutliPlayersData');
            console.log(data.players);
            data.players.forEach((currentPlayer, index)=>{
                setPlayer(currentPlayer);
            });
        }
    };
    
    //ajax get the thingy
    $.get( 'http://'+host+'/externalip', function( data ) {
        // Create our websocket object with the address to the websocket
        service.ws = new WebSocket('ws://' + data + ':8181');
        service.ws.onmessage = onmessage;
        service.ws.onopen = onopen;
    });
    
    service.setPlayerData = function(name, clr, type, ready) {
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