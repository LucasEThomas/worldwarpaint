"use strict";
var Utility = require('./Utility.js');
var AStar = require('./AStar.js');

class Map {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.terrainMap = [];
        this.objectMap = [];

        this.generateMap();
    }

    // procedurally generate the map
    generateMap() {
        // generate the grass
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

        function rAV(myArray) {
            return myArray[Math.floor(Math.random() * myArray.length)];
        }

        var xBorders = [0, this.mapWidth - 1];
        var yBorders = [0, this.mapHeight - 1];

        var startX = 0;
        var startY = 0;
        switch (Math.rangeInt(0, 1)) {
            case 0:
                var startX = Math.rangeInt(0, this.mapWidth - 1);
                if (startX === 0 || startX === this.mapWidth - 1) {
                    // pick any startY
                    startY = Math.rangeInt(0, this.mapHeight - 1);
                } else {
                    // pick an end or startY on the border only (0 or this.mapWidth - 1)
                    startY = rAV(yBorders);
                }
                break;

            case 1:
                var startY = Math.rangeInt(0, this.mapHeight - 1);
                if (startY === 0 || startY === this.mapHeight - 1) {
                    // pick any startX
                    startX = Math.rangeInt(0, this.mapWidth - 1);
                } else {
                    // pick an end or startY on the border only (0 or this.mapWidth - 1)
                    startX = rAV(xBorders);
                }
                break;
        }
        // pick a startNode

        var startNode = [startX, startY];

        // pick an endNode
        var endX = Math.rangeInt(0, this.mapWidth - 1);
        var endY = 0;
        if (endX === 0 || endX === this.mapWidth - 1) {
            // pick any endY
            endY = Math.rangeInt(0, this.mapHeight - 1);
        } else {
            // pick an endY on the border only (0 or this.mapWidth - 1)
            endY = (startY === 0) ? this.mapHeight - 1 : 0;
        }
        var endNode = [endX, endY];

        console.log(startNode);
        console.log(endNode);

        // pick start/end nodes for the river
        /*var startNode = [Math.rangeInt(0, this.mapWidth - 1), Math.rangeInt(0, this.mapHeight - 1)];
        var endNode = [Math.rangeInt(0, this.mapWidth - 1), Math.rangeInt(0, this.mapHeight - 1)];*/
        var timeOut = 128; // try this many times to find a suitable end node (in this case one that doesn't equal the startNode coords)
        while (endNode.equals(startNode)) {
            if (timeOut === 0) {
                console.log("FAILURE: Can't find a suitable end node!");
                break;
            }
            endNode = [Math.rangeInt(0, this.mapWidth - 1), Math.rangeInt(0, this.mapHeight - 1)];
            timeOut -= 1;
        }

        // find the river path
        //var path = this.findPath(startNode, endNode);

        var nodes = [];
        var nodeWeights = [];

        // create the nodes and a default weight of 0 for each one
        for (var x = 0; x < this.mapWidth; x++) {
            for (var y = 0; y < this.mapHeight; y++) {
                nodes.push([x, y]);
                nodeWeights[[x, y]] = 0;
            }
        }

        // generate a bunch of random weights to create a fake random flow for the river
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

        // update the terrain map with the river path (calculate turns (or maybe turns are calculated from arrow code??))
        //   first set the start and end node terrain
        this.terrainMap[startNode[1]][startNode[0]] = 2;
        this.terrainMap[endNode[1]][endNode[0]] = 2;
        //   iterate over the path to draw the river
        var iCurrentNode = endNode;
        var iPrevNode;
        var iNextNode;
        var iPrevNodeDir;

        /* pseudocodify
            while currentNode is not the startNode
                if currentNode is not the endNode
                    iterate through each possible neighbor
                        if neighbor is next in path
                            nextNode is neighbor
                            // prevNode was set last iteration
                            // currentNode is also already set
                            // compare nextNode to prevNode
                            if nextNodeX === prevNodeX OR nextNodeY === prevNodeY
                                currentNode is a straight path
                            else iterate with +2 on each neighbor, use neighbor index +2 to determine water code
        */

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

        while (!iCurrentNode.equals(startNode)) {
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
                    //console.log('Iterate: ' + iCurrentNode + ', ' + neighbor);
                    if (path[iCurrentNode].equals(neighbor)) {
                        // in order to know if it's a turn or a straight,
                        //   we need to look at the previous and next nodes
                        //this.terrainMap[iCurrentNode[1]][iCurrentNode[0]] = ind + 3;

                        iNextNode = neighbor;

                        var checkDirs = [[0, -1], [-1, 0], [0, 1], [1, 0]];
                        checkDirs.forEach(function(dir2, ind2, arr2) {
                            var prevNeighbor = [iCurrentNode[0] + dir2[0], iCurrentNode[1] + dir2[1]]

                            if (iPrevNode.equals(prevNeighbor)) {
                                // found the previous neighbor node
                                this.terrainMap[iCurrentNode[1]][iCurrentNode[0]] = assignVal(ind, ind2);
                            }
                        }, this);



                        //-----------
                        /*iNextNode = neighbor;
                        if (iNextNode[0] === iPrevNode[0] || iNextNode[1] === iPrevNode[1]) {
                            this.terrainMap[iCurrentNode[1]][iCurrentNode[0]] = 2;
                        } else {
                            var checkDirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
                            checkDirs.forEach(function(dir, ind2, arr) {
                                var checkNeighbor = [iPrevNode[0] + dir[0], iPrevNode[1] + dir[1]];
                                if (checkNeighbor.equals(iNextNode)) {
                                    console.log(ind+ind2);
                                    this.terrainMap[iCurrentNode[1]][iCurrentNode[0]] = ind + ind2 + 3;
                                }
                            }, this);
                        }*/
                        //--------
                    }
                }, this);
            }
            iPrevNode = iCurrentNode;
            iCurrentNode = path[iCurrentNode];
        }
    }
}

module.exports = Map;