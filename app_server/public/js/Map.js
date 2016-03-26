"use strict";

class Map {
    constructor() {
        //
    }

    setTerrainMap(terrainMap) {
        this.terrainMap = terrainMap;
    }

    renderTerrainTexture(terrain) {
        terrainRenderTexture = game.add.renderTexture(3548, 2048, 'terrainBackground');
        var noteTile = game.make.sprite(0, 0, 'notebookPaper');
        noteTile.anchor.set(.5);
        for (var nx = 0; nx < 4096; nx += 1132) {
            for (var ny = 0; ny < 4096; ny += 654) {
                terrainRenderTexture.renderXY(noteTile, nx, ny);
                terrainRenderTexture.renderXY(noteTile, nx + 1132 / 2, ny + 654 / 2);
            }
        }
        var gridX = 0;
        for (var xx = 0; xx < 2048; xx += 32) {
            // track map grid position in map terrain array (list of grass/water/etc)
            var gridY = 0;
            for (var yy = 0; yy < 2048; yy += 32) {
                // Create a tile using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                //var tile = (Math.random() < .9) ? game.make.sprite(0, 0, 'grass1') : game.make.sprite(0, 0, 'grass2');
                var coordVal = terrain[gridY][gridX];
                var gTile = game.make.sprite(0, 0, 'mGrass0');
                switch (coordVal) {
                    default:
                        var tile = game.make.sprite(0, 0, 'mGrass0');
                        break;

                    case 1:
                        var tile = game.make.sprite(0, 0, 'mGrass1');
                        break;

                    case 2:
                        var tile = game.make.sprite(0, 0, 'mWater0');
                        break;

                    case 3:
                        var tile = game.make.sprite(0, 0, 'mWater1');
                        break;

                    case 4:
                        var tile = game.make.sprite(0, 0, 'mWater2');
                        break;

                    case 5:
                        var tile = game.make.sprite(0, 0, 'mWater3');
                        break;

                    case 6:
                        var tile = game.make.sprite(0, 0, 'mWater4');
                        break;

                }
                tile.anchor.set(0.5);
                gTile.anchor.set(0.5);
                var point = game.iso.projectXY({
                    x: xx,
                    y: yy,
                    z: 0
                });
                terrainRenderTexture.renderXY(gTile, point.x, point.y);
                terrainRenderTexture.renderXY(tile, point.x, point.y);
                gridY++;
            }
            gridX++;
        }
        game.add.sprite(0, 0, terrainRenderTexture);
    }
}

//module.exports = Map;