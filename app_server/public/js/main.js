"use strict";
//var Player = require('./player.js');
//var tower = require('./tower.js');
//var Map = require('./Map.js');

angular.module('app', ['services.roomServer']);

angular.module('app').controller('RoomController', ['$scope', '$rootScope', 'roomServer', function($scope, $rootScope, RoomServerService) {
    $rootScope.teams = [];

    $scope.styleGreen = {
        color: '#44FF44'
    };
    $scope.styleRed = {
        color: '#FF4400'
    };
}]);

var game;
var startGame = function(playerType) {
    //todo, disconnect room server ws connection
    $('#setupContainer').remove();
    game = new Game();
}