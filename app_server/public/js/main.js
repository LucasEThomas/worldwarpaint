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
    
    $scope.playerTypes = [
        {
            image:'assets/optionCommander.png',
            text:'Commander',
            selected:false,
            clr1:'#D0D0D0',
            clr2:'#F0F0F0'
        },
        {
            image:'assets/optionEngineer.png',
            text:'Engineer',
            selected:false,
            clr1:'#D0D0D0',
            clr2:'#F0F0F0'
        },
        {
            image:'assets/optionChampion.png',
            text:'Champion',
            selected:false,
            clr1:'#D0D0D0',
            clr2:'#F0F0F0'
        },
        {
            image:'assets/optionArcher.png',
            text:'Archer',
            selected:false,
            clr1:'#D0D0D0',
            clr2:'#F0F0F0'
        }
    ];
    $scope.deselectAllPlayerTypes = () => {
        $scope.playerTypes.forEach((e,n)=>{
            e.selected = false;
        });
    };
    
    $scope.sendPlayerData = () => {
        console.log($scope);
        RoomServerService.setPlayerData($scope.name, $scope.clr, $scope.type, true);
    };
    
}]);

angular.module('app').directive("customRadioButton", () => {
    return {
        replace:true,
        restrict: 'AE',
        template: `
        <div class="button" height="128px" width="128px" style="display:inline-flex; flex-flow:column nowrap; justify-content:flex-end; align-items: center;  height:128px; width:128px; background-image: linear-gradient({{playerType.selected?playerType.clr1:playerType.clr2}},{{playerType.selected?playerType.clr2:playerType.clr1}}); border-radius:8px; border-color:#303030;">
            <img ng-src="{{playerType.image}}">
            <h4 style="margin:0px">{{playerType.text}}</h4>
        </div>
        `,
        link: (scope, elem, attrs) => {
            elem.bind('click', function() {
                scope.$apply(function() {
                    scope.$parent.type = scope.playerType.text;
                    scope.deselectAllPlayerTypes();
                    scope.playerType.selected = true;
                });
            });
            elem.bind('mouseover', function() {
                elem.css('cursor', 'pointer');
            });
        }
    }
});

var game;
var startGame = function(playerType) {
    //todo, disconnect room server ws connection
    $('#setupContainer').remove();
    game = new Game();
}