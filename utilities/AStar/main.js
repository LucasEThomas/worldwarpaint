$(document).ready(function() {
    // this holds the array of nodes
    var nodes = [];

    // this holds the nodes in a map format so we can display it visually
    var map = [];

    // set size of grid
    var xSize = 21; // horizontal
    var ySize = 21; // vertical

    // generate the nodes list
    for (var y = 0; y < ySize + 1; y++) {
        // create a "table" row to hold the columns
        var mapRow = [];
        for (var x = 0; x < xSize + 1; x++) {
            // push a new column into the map row
            mapRow.push(0);
            // add the node to the nodes list
            nodes.push([x, y]);
        }
        // push the map row to the map list
        map.push(mapRow);
    }

    // pick a random start node for the map dict
    var startNodeDict = {
        x: Math.rangeInt(0, xSize),
        y: Math.rangeInt(0, ySize)
    };
    // same random node, but formatted for the search algorithm
    var startNode = [startNodeDict.x, startNodeDict.y];

    // pick a random end node for the map dict
    var endNodeDict = {
        x: Math.rangeInt(0, xSize),
        y: Math.rangeInt(0, ySize)
    };
    // same random node, but formatted for the search algorithm
    var endNode = [endNodeDict.x, endNodeDict.y];

    // set the map node values so they can be colored by the drawMap function
    map[startNodeDict.y][startNodeDict.x] = 1;
    map[endNodeDict.y][endNodeDict.x] = 2;

    // draw the map
    drawMap(map);

    $('#stepNode').click(function() {
        // how many times to step through?
        var stepNumber = $('#stepNumber').val();
        stepNumber = stepNumber > 0 ? stepNumber : 1;
        for (var i = 0; i < stepNumber; i++) {
            checkStopSearching();
            // step through the search algorithm once for a single node
            stepNodeSearch();
            //drawMap(map);
        }
    });

    function checkStopSearching() {
        if (frontier.length === 0) {
            $('#stepNodeTimerToggle').attr('disabled', 'disabled');
            $('#stepNodeTimerToggle').text('Run');
            $('#stepNode').attr('disabled', 'disabled');
            $('#stepTimer').attr('disabled', 'disabled');
            $('#stepNumber').attr('disabled', 'disabled');
            clearInterval(nodeTimer);
            nodeTimer = undefined;
        }

    }

    var nodeTimer;

    $('#stepNodeTimerToggle').click(function() {
        if (nodeTimer) {
            clearInterval(nodeTimer);
            nodeTimer = undefined;
        } else {
            nodeTimer = setInterval(function() {
                checkStopSearching();
                stepNodeSearch();
            }, $('#stepTimer').val());
        }
        $(this).text(function(i, text) {
            return text === "Run" ? "Stop" : "Run";
        })
    });

    $('#stepNeighbor').click(function() {
        // step through the search algorithm once but only for a single neighbor of a single node
        stepNeighborSearch();
    });

    $('#stepAll').click(function() {
        // step through the search algorithm until the end node is reached
        allSearch();
    });

    //-- setup vars for the search (making them global so we can sync step and stepAll searches)------

    // create the "frontier" queue (nodes to be explored)
    var frontier = [];

    // add start node to the frontier
    frontier.push(startNode);

    // create came_from list (used to log search history)
    var came_from = [];

    // add start node with from as null to came_from list
    came_from[startNode] = null;

    //------------------------------------------------------------------------------------------------

    // define neighbor function to find edges between nodes
    function neighbors(node) {
        // define the search directions
        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        // create a variable to store neighbor nodes
        var result = [];
        // iterate through each direction
        dirs.forEach(function(dir, ind, arr) {
            // get the possible neighbor's coordinates
            var neighbor = [node[0] + dir[0], node[1] + dir[1]];
            // if neighbor coordinates are within map bounds
            if (0 <= neighbor[0] && neighbor[0] <= xSize && 0 <= neighbor[1] && neighbor[1] <= ySize) {
                result.push(neighbor);
            }
        });
        return result;
    }

    // define search function that searches one full node
    function stepNodeSearch() {
        // check if there is anything in the queue
        if (frontier.length > 0) {
            // get the first node in the queue
            var currentNode = frontier.shift();

            // break the search if the current node is the same as the end node
            if (currentNode.equals(endNode)) {
                // make sure the class for the end node is set to the end class
                $('#c' + endNode[0] + 'r' + endNode[1]).attr("class", "end");
                // empty the queue as we've found the end
                frontier = [];
                // stop the function process
                return;
            }

            // iterate through each neighbor
            neighbors(currentNode).forEach(function(next, ind, arr) {
                // if next is not in came_from (not in the search path)
                if (came_from[next] !== null && came_from[next] === undefined) {
                    // add next node to queue
                    frontier.push(next);
                    // add next to came_from with currentNode as from
                    came_from[next] = currentNode;
                    // if the neighbor node is not the end, set the cell to class neighbor
                    if (!next.equals(endNode)) {
                        $('#c' + next[0] + 'r' + next[1]).attr("class", "path");
                        map[next[1]][next[0]] = 3;
                    }
                }
            });
        }
        console.log(came_from);
    }

    // redraw entire map
    function drawMap(map) {
        // generate map html
        var mapHTML = "<table>";
        map.forEach(function(row, y, arr) {
            mapHTML += "<tr>";
            row.forEach(function(col, x, arr) {
                var colType;
                switch (col) {
                    case 1:
                        colType = 'start';
                        break;
                    case 2:
                        colType = 'end';
                        break;
                    case 3:
                        colType = 'path';
                        break;
                    case 4:
                        colType = 'neighbor';
                        break;
                    case 5:
                        colType = 'ignore';
                        break;

                    default:
                        colType = 'empty';
                }
                mapHTML += '<td id="c' + x + 'r' + y + '" class="' + colType + '"></td>';
            });
            mapHTML += "</tr>";
        });
        mapHTML += "</table>";
        $('#atable').html(mapHTML);
    }
});

//--------------------------------------------------------------

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function(array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            } else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
    // Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});