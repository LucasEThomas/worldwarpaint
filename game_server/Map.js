"use strict";
var Utility = require('./Utility.js');
var AStar = require('./AStar.js');
var Victor = require('victor');

class Map {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.terrainMap = [];
        this.objectMap = [];
        this.nodeWeights = [];

        // hold a map containing object types (e.g. tree, house, river, etc.)
        // hold a map containing weights for each grid position

        this.generateMap();
    }

    pickBorderCoord(width, height) {
        function rAV(myArray) {
            return myArray[Math.floor(Math.random() * myArray.length)];
        }

        var xBorders = [0, width - 1];
        var yBorders = [0, height - 1];

        // randomly start with X or Y
        var x = 0;
        var y = 0;
        switch (Math.rangeInt(0, 1)) {
            case 0:
                var x = Math.rangeInt(0, width - 1); // shave off 1 if mapWidth/Height is passed without shaving 1
                if (x === 0 || x === width - 1) {
                    y = Math.rangeInt(0, height - 1);
                } else {
                    // pick an end or startY on the border only (0 or this.mapWidth - 1)
                    y = rAV(yBorders);
                }
                break;

            case 1:
                var y = Math.rangeInt(0, height - 1);
                if (y === 0 || y === height - 1) {
                    // pick any startX
                    x = Math.rangeInt(0, width - 1);
                } else {
                    // pick an end or startY on the border only (0 or this.mapWidth - 1)
                    x = rAV(xBorders);
                }
                break;
        }
        return [x, y];
    }

    pickRandomCoord() {
        return {
            x: Math.rangeInt(0, this.mapWidth - 1),
            y: Math.rangeInt(0, this.mapHeight - 1)
        };
    }

    // procedurally generate the map
    generateMap() {
        // generate the grass
        // generate cities and intra-roads
        // generate inter-city paths
        // generate rivers (stop at forks)
        // actually, let's redo this
        // create a "big river" function that creates a wide "main" river
        // and create "little rivers" based off of points on that main river
        // maybe use the heuristic to prevent split offs from being to close? (so a reversed "closest point" heuristic)
        // create a "small river" function that creates a small river
        // if it intersects any other river, it forks into it and "dies"
        // generate trees/forests
        // generate shrubs/other nature

        // pick the river start node (support both diagonal directions)
        // pick the river end node
        // find the river path (pass in impassable nodes (e.g. buildings/zones/etc))
        // update terrain map with river path sprites

        // generate the grass
        for (var y = 0; y < this.mapHeight; y++) {
            this.terrainMap[y] = [];
            for (var x = 0; x < this.mapWidth; x++) {
                this.terrainMap[y][x] = (Math.random() < .9) ? 0 : 1;
            }
        }

        var nodes = [];

        // create the nodes and a default weight of 0 for each one
        for (var x = 0; x < this.mapWidth; x++) {
            for (var y = 0; y < this.mapHeight; y++) {
                nodes.push([x, y]);
                this.nodeWeights[[x, y]] = 0;
            }
        }

        // generate the first (main) river
        this.generateRiver(3, this.nodeWeights);
        this.generateRiver(3, this.nodeWeights);


        // generate trees and forests
        this.generateForests();
        this.generateForests();

        // generate bushes/shrubs
        //this.generateBushes();


    }

    generateBushes() {
        for (var x = 0; x < this.mapWidth; x++) {
            for (var y = 0; y < this.mapHeight; y++) {
                if (this.terrainMap[x][y] === 0) {
                    if (Math.random() < 0.02) {
                        this.terrainMap[x][y] = Math.rangeInt(10, 13);
                        this.nodeWeights[[x, y]] = 999999;
                    }
                }
            }
        }
    }

    generateTree(x, y, probability) {
        if (this.terrainMap[x][y] === 0) {
            if (Math.random() < probability) {
                this.terrainMap[x][y] = Math.rangeInt(7, 9);
                this.nodeWeights[[x, y]] = 999999;
            } else if (Math.random() < probability - Math.random() * .7) {
                this.terrainMap[x][y] = Math.rangeInt(10, 13);
                this.nodeWeights[[x, y]] = 999999;
            }
        }
    }

    generateForests() {
        var center = this.pickRandomCoord();
        var radius = 16;
        let centerVictor = new Victor(center.x, center.y)

        let lowerX = ((center.x - radius) >= 0) ? (center.x - radius) : 0;
        let upperX = ((center.x + radius) < this.mapWidth) ? center.x + radius : this.mapWidth - 1;
        let lowerY = ((center.y - radius) >= 0) ? (center.y - radius) : 0;
        let upperY = ((center.y + radius) < this.mapHeight) ? center.y + radius : this.mapHeight - 1;


        for (var x = lowerX; x < upperX; x++) {
            for (var y = lowerY; y < upperY; y++) {
                let distance = new Victor(x, y).distance(centerVictor);
                distance = (distance > radius) ? radius : distance;
                this.generateTree(x, y, 0.5 - (distance / radius) * 0.5);
            }
        }
    }

    generateRiver(width, nodeWeights) {
        // set a start and an end node
        var startNode = this.pickBorderCoord(this.mapWidth, this.mapHeight);
        var endNode = this.pickBorderCoord(this.mapWidth, this.mapHeight);

        console.log(startNode);
        console.log(endNode);

        var timeOut = 128; // try this many times to find a suitable end node (in this case one that doesn't equal the startNode coords)
        while (endNode.equals(startNode)) {
            console.log('WARNING: endNode is equal to startNode, trying to find a suitable new endNode')
            if (timeOut === 0) {
                console.log("FAILURE: Can't find a suitable end node!");
                break;
            }
            endNode = this.pickBorderCoord(this.mapWidth, this.mapHeight);
            timeOut -= 1;
        }

        // generate a bunch of random weights to create a pseudo random flow for the river
        for (var x = 0; x < this.mapWidth; x++) {
            for (var y = 0; y < this.mapHeight; y++) {
                if (![x, y].equals(startNode) && ![x, y].equals(endNode) && nodeWeights[[x, y]] === 0) {
                    if (Math.random() < .9) {
                        nodeWeights[[x, y]] = Math.floor(Math.random() * (24 - 1)) + 1;
                    }
                }
            }
        }

        var findRiverPath = new AStar(this.mapWidth, this.mapHeight, startNode, endNode, nodeWeights);
        var path = findRiverPath.path;

        // update the terrain map with the river path (calculate turns)
        //   first set the start and end node terrain
        this.terrainMap[startNode[1]][startNode[0]] = 2;
        this.terrainMap[endNode[1]][endNode[0]] = 2;
        //   iterate over the path to draw the river
        var iCurrentNode = findRiverPath.last_node;
        var iPrevNode = [];
        var iNextNode;
        var iPrevNodeDir;

        function assignVal(one, two) {

            var comp = (1 << one) + (16 << two);

            if (comp === 17 || comp === 136) {
                // right to top join
                return 3;
            } else if (comp === 34 || comp === 68) {
                // left to bottom join
                return 4;
            } else if (comp === 65 || comp === 130) {
                // right to bottom join
                return 5;
            } else if (comp === 20 || comp === 40) {
                // left to top join
                return 6;
            } else {
                // it's a straight
                return 2;
            }
        }

        console.log('river go');
        console.log(startNode);
        console.log(endNode);
        console.log(iCurrentNode);
        console.log('river end');
        while (!iCurrentNode.equals(startNode)) {
            this.nodeWeights[[[iCurrentNode[0]], [iCurrentNode[1]]]] = 1000000;
            //this.nodeWeights[[iCurrentNode[0],iCurrentNode[1]]] = 1000000;
            if (!iCurrentNode.equals(endNode)) {
                // get direction of other node
                // right, down, left, up
                var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                // create a variable to store neighbor nodes
                var result = [];
                // iterate through each direction
                dirs.forEach(function(dir, ind, arr) {
                    // get the possible neighbor's coordinates
                    var neighbor = [iCurrentNode[0] + dir[0], iCurrentNode[1] + dir[1]];
                    if (path[iCurrentNode].equals(neighbor)) {
                        // in order to know if it's a turn or a straight,
                        //   we need to look at the previous and next nodes

                        iNextNode = neighbor;

                        var checkDirs = [[0, -1], [-1, 0], [0, 1], [1, 0]];
                        checkDirs.forEach(function(dir2, ind2, arr2) {
                            var prevNeighbor = [iCurrentNode[0] + dir2[0], iCurrentNode[1] + dir2[1]]

                            if (iPrevNode.equals(prevNeighbor)) {
                                // found the previous neighbor node
                                this.terrainMap[iCurrentNode[1]][iCurrentNode[0]] = assignVal(ind, ind2);
                            }
                        }, this);
                    }
                }, this);
            }
            iPrevNode = iCurrentNode;
            iCurrentNode = path[iCurrentNode];
        }

    }
}

module.exports = Map;