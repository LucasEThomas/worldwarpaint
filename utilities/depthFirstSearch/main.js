// Depth-first Search Algorithm
// still NOT an A* algorithm

/* Visualization Legend:
//      Green           -   Starting Node
//      Red             -   End/Goal Node
//      Grey            -   Node Not Evaluated (Evaluation #0)
//      AquaMarine      -   Node Evaluated as a Neighbor Node (Evaluation #1)
//      Red Outline     -   Next Node to be Fully Evaluated (Evaluation #2a)
//      Aqua            -   Node Fully Evaluated (Explored) (Evaluation #2b)
//      Arrow Direction -   Base of arrow is coming from the Node (which is Aqua/Eval#2b by now) that evaulated the Node w/ the arrow as a
//                              Neighbor Node (the Node w/ the arrow is at least at Evaluation #1)
*/

$(document).ready(function() {
    // holds array of all nodes
    var nodes = [];

    // holds array of nodes in map format for visualization purposes
    var map = [];

    // set size of grid
    var xSize = 41; // horizontal
    var ySize = 41; // vertical

    // generate nodes list
    for (var y = 0; y < ySize + 1; y++) {
        // create the map row
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
    drawSquare(startNode[0], startNode[1], '#0f0');

    // pick a random end node for the map dict
    var endNodeDict = {
        x: Math.rangeInt(0, xSize),
        y: Math.rangeInt(0, ySize)
    };
    // same random node, but formatted for the search algorithm
    var endNode = [endNodeDict.x, endNodeDict.y];
    drawSquare(endNode[0], endNode[1], '#f00');

    // set the map node values so they can be colored by the drawMap function
    map[startNodeDict.y][startNodeDict.x] = 1;
    map[endNodeDict.y][endNodeDict.x] = 2;

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
            $('#stepNode').removeAttr('disabled');
        } else {
            nodeTimer = setInterval(function() {
                checkStopSearching();
                $('#stepNode').attr('disabled', 'disabled');
                stepNodeSearch();
            }, $('#stepTimer').val());
        }
        $(this).text(function(i, text) {
            return text === "Run" ? "Stop" : "Run";
        })
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
        console.log('start get neighbor');
        // define the search directions
        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        // create a variable to store neighbor nodes
        var result = [];
        // iterate through each direction
        for (i = 0; i < dirs.length; i++) {
            // get the possible neighbor's coordinates
            var neighbor = [node[0] + dirs[i][0], node[1] + dirs[i][1], i];
            console.log('neighbor:');
            console.log(neighbor);
            // if neighbor not already searched
            if (came_from[[neighbor[0], neighbor[1]]] !== null && came_from[[neighbor[0], neighbor[1]]] === undefined) {
                console.log('neighbor NOT evaluated');
                // if neighbor coordinates are within map bounds
                if (0 <= neighbor[0] && neighbor[0] <= xSize && 0 <= neighbor[1] && neighbor[1] <= ySize) {
                    console.log('neighbor in bounds');
                    result.push(neighbor);
                    return result;
                }
            }
        };
        if (!result) {
            console.log('no neighbor found, RECURSERATE!');
            return neighbors(came_from[came_from.length - 1]);
        }
        return false;
    }

    // define search function that searches one step
    function stepNodeSearch() {
        // check if there is anything in the queue
        if (frontier.length > 0) {
            // get the first node in the queue
            var currentNode = frontier.shift();

            // break the search if the current node is the same as the end node
            if (currentNode.equals(endNode)) {
                frontier = [];
                return;
            } else if (!currentNode.equals(startNode)) {
                drawSquare(currentNode[0], currentNode[1], 'aqua');
            }

            // iterate through the next node
            if (neighbors(currentNode)) {
                console.log("has a neighbor");
                neighbors(currentNode).forEach(function(next, ind, arr) {
                    var direction = next.pop();
                    // if next is not in came_from (not in the search path)
                    if (came_from[next] !== null && came_from[next] === undefined) {
                        // add next node to queue
                        frontier.push(next);
                        // add next to came_from with currentNode as from
                        came_from[next] = currentNode;
                        // if the neighbor node is not the end, set the cell to class neighbor
                        if (!next.equals(endNode)) {
                            //$('#c' + next[0] + 'r' + next[1]).attr("class", "path");
                            drawSquare(next[0], next[1], 'aquamarine');
                            drawDirArrow(next[0], next[1], direction);
                            map[next[1]][next[0]] = 3;
                        }
                    }
                });
            }
        }
    }

});

//--------------------------------------------------------------
// found this online, makes comparing two arrays very easy
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