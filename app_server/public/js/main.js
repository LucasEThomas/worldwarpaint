"use strict";

angular.module('app', ['services.roomServer']);

angular.module('app').controller('RoomController', ['$scope', '$rootScope', 'roomServer', function($scope, $rootScope, RoomServerService) {
    $rootScope.teams = [];
    $rootScope.rooms = {};

    $scope.styleGreen = {
        color: '#44FF44'
    };
    $scope.styleRed = {
        color: '#FF4400'
    };
    
    $scope.deselectAllPlayerTypes = () => {
        $scope.playerTypes.forEach((e,n)=>{
            e.selected = false;
        });
    };
    
    $scope.sendPlayerData = () => {
        console.log($scope);
        var colorsDict = {
            blue: '#4186EF',
            teal: '#57C5B8',
            white: '#ECE0F2',
            yellow: '#ECC82F',
            orange: '#F28B31',
            red: '#EB4D4D',
            magenta: '#EC53AC',
            violet: '#9950B4'
        };
        RoomServerService.setPlayerData($scope.name, colorsDict[$scope.clr], $scope.type, true);
    };
    
}]);

var game;
var startGame = function(playerType) {
    //todo, disconnect room server ws connection?
    $('#setupContainer').remove();
    game = new Game();
}