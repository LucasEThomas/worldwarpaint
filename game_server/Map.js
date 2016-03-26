"use strict";

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
        for (var y = 0; y < this.mapHeight; y++) {
            this.terrainMap[y] = [];
            for (var x = 0; x < this.mapWidth; x++) {
                this.terrainMap[y][x] = (Math.random() < .9) ? 0 : 1;
            }
        }

        // pick start/end nodes for the river

        // find the river path

        // update the terrain map with the river path (calculate turns (or maybe turns are calculated from arrow code??))
    }

    // aStar
    findPath(startNode, endNode) {
        // return path nodes or false if no path
    }
}

module.exports = Map;