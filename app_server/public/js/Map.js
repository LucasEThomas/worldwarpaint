"use strict";

class Map extends Phaser.RenderTexture {
    constructor(game) {
        super(game, 3548, 2048, 'terrainBackground');
        game.world.create(0, 0, this);
    }

    setTerrainMap(terrainMap) {
        this.terrainMap = terrainMap;
    }

    renderTerrainTexture(terrain) {

        var noteTile = game.make.sprite(0, 0, 'notebookPaper');
        noteTile.anchor.set(.5);
        for (var nx = 0; nx < 4096; nx += 1132) {
            for (var ny = 0; ny < 4096; ny += 654) {
                this.renderXY(noteTile, nx, ny);
                this.renderXY(noteTile, nx + 1132 / 2, ny + 654 / 2);
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
                let imageName = '';
                let tileAnchor = [0.5];
                let unitsLayer = false;
                switch (coordVal) {
                    default: imageName = 'mGrass0';
                    break;

                    case 1:
                            imageName = 'mGrass1';
                        break;

                    case 2:
                            imageName = 'mWater0';
                        break;

                    case 3:
                            imageName = 'mWater1';
                        break;

                    case 4:
                            imageName = 'mWater2';
                        break;

                    case 5:
                            imageName = 'mWater3';
                        break;

                    case 6:
                            imageName = 'mWater4';
                        break;

                    case 7:
                            imageName = 'mTree0';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 8:
                            imageName = 'mTree1';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 9:
                            imageName = 'mTree2';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 10:
                            imageName = 'mBush0';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 11:
                            imageName = 'mBush1';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 12:
                            imageName = 'mBush2';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                    case 13:
                            imageName = 'mBush3';
                        tileAnchor = [0.5, .9];
                        unitsLayer = true;
                        break;

                }

                let gTile = game.make.sprite(0, 0, 'mGrass0');
                gTile.anchor.set(0.5);
                var point = game.iso.projectXY({
                    x: xx,
                    y: yy,
                    z: 0
                });
                this.renderXY(gTile, point.x, point.y);
                if (unitsLayer) {
                    let sprite = game.add.isoSprite(xx, yy, 0, imageName, 0, game.units.group);
                    sprite.anchor.setTo(...tileAnchor);
                } else {
                    let tile = game.make.sprite(0, 0, imageName);
                    tile.anchor.set(...tileAnchor);
                    this.renderXY(tile, point.x, point.y);
                }

                gridY++;
            }
            gridX++;
        }
    }
}

//module.exports = Map;