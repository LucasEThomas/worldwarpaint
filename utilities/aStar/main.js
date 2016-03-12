$(document).ready(function() {

    // disable place buttons while algorithm is running or when algorithm has started
    // except allow the reset button to stop the algorithm and reset the map

    var gridWidth = 36;
    var gridHeight = 18;

    var startNode = undefined; // the start node coords
    var endNode = undefined; // the end node coords

    // create global vars
    var frontier; // the queue
    var came_from; // track the path
    var cost_so_far; // track the path cost

    function aStar_init() {
        // reset global vars
        frontier = [];
        came_from = [];
        cost_so_far = [];

        // setup the first node
        frontier.push(startNode);
    }

    function aStar_step() {

    }

    function aStar_searchAll() {
        var frontier = [];
        frontier.push(startNode);
        var came_from = [];
        var cost_so_far = [];
        came_from[startNode] = null;
        cost_so_far[startNode] = 0;

        while (frontier.length > 0) {
            var currentNode = frontier.shift();

            if (currentNode.equals(endNode)) {
                console.log('Found End Node - STOP Searching');
                break;
            }
            
            

            /*
            for next in graph.neighbors(current):
                new_cost = cost_so_far[current] + graph.cost(current, next)
                if next not in cost_so_far or new_cost < cost_so_far[next]:
                    cost_so_far[next] = new_cost
                    priority = new_cost + heuristic(goal, next)
                    frontier.put(next, priority)
                    came_from[next] = current
            */
        }
        // return came_from, cost_so_far
    }

    function heuristic(a, b) {
        return Math.abs(a[0] - b[0]) + abs(a[1] - b[1]);
    }

    // NOT THE FINAL FUNCTION, only a test for full A*
    $('#stepNodeTimerToggle').click(function() {
        if (startNode && endNode) {
            console.log('Starting A*...');
            aStar_searchAll();
        } else {
            console.log('Set a start node and an end node');
        }
    });

    // resize the canvas
    function resetCanvas() {
        $('canvas').each(function(i, e) {
            var newWidth = gridWidth * (cellSize + borderSize) + 2;
            var newHeight = gridHeight * (cellSize + borderSize) + 2;
            $(this).prop({
                width: newWidth,
                height: newHeight
            });
            $(this).width(newWidth).height(newHeight);
            initialPopulation(gridWidth, gridHeight);
        });
    }

    // call resetCanvas on page load
    resetCanvas();

    /* current type of object we are placing on the map
    // 0 = nothing
    // 1 = start
    // 2 = end
    // 3 = inpassable object
    // 4 = weighted path (e.g. mountain, river, etc.)
    */
    var placeObj = 0;

    // listen for mouse clicks on canvas
    $('#canvas2').mousedown(function(event) {
        //console.log('[*] Mouse clicked in canvas:');
        var clickPos = getGraphPos(canvas, event);
        switch (event.which) {
            // left mouse click
            case 1:
                switch (placeObj) {
                    case 1:
                        // disallow placing over end node
                        if (endNode) {
                            if (endNode.equals(clickPos)) {
                                break;
                            }
                        }
                        // reset the algorithm since the map has changed
                        aStar_init();

                        // unmark the previous start node on the canvas
                        if (startNode) {
                            drawSquare(startNode[0], startNode[1], '#ddd');
                        }

                        // set the start node to the new position
                        startNode = clickPos;

                        // mark the new start node on the canvas
                        drawSquare(clickPos[0], clickPos[1], 'chartreuse');

                        // turn off start object placement
                        placeObj = 0;
                        break;
                    case 2:
                        // disallow placing over start node
                        if (startNode) {
                            if (startNode.equals(clickPos)) {
                                break;
                            }
                        }
                        // reset the algorithm since the map has changed
                        aStar_init();

                        // unmark the previous end node on the canvas
                        if (endNode) {
                            drawSquare(endNode[0], endNode[1], "#ddd");
                        }

                        // set the end node to the new position
                        endNode = clickPos;

                        drawSquare(clickPos[0], clickPos[1], 'crimson');
                        // turn off end object placement
                        placeObj = 0;
                        break;
                    case 3:
                        // reset the algorithm since the map has changed
                        aStar_init();

                        drawSquare(clickPos[0], clickPos[1], 'black');
                        break;
                    case 4:
                        // reset the algorithm since the map has changed
                        aStar_init();

                        console.log('[*]    Increase path cost at: ' + clickPos);
                        // get currrent node cost

                        break;
                }
                break;
                // \/ right mouse click \/
            case 3:
                if (placeObj === 4) {
                    // reset the algorithm since the map has changed
                    aStar_init();

                    // decrease weight of path
                    console.log('[*]    Decrease path cost at: ' + clickPos);
                }
                break;
        }
        event.preventDefault();
    });

    // handle placement functions

    // keyboard shortcuts!
    $(document).on('keyup', function(e) {
        switch (e.which) {
            case 192:
                placeObj = 0;
                break;
            case 49:
                // 1 key
                placeObj = 1;
                break;
            case 50:
                // 2 key
                placeObj = 2;
                break;
            case 51:
                // 3 key
                placeObj = 3;
                break;
            case 52:
                // 4 key
                placeObj = 4;
                break;
        }
    });

    $('#placeNothing').click(function() {
        console.log('[*] Turn off placement of items');
        // set object being placed
        placeObj = 0;
    });

    $('#placeStart').click(function() {
        console.log('[*] Enable: Place Start');
        // set object being placed
        placeObj = 1;
    });

    $('#placeEnd').click(function() {
        console.log('[*] Enable: Place End');
        // set object being placed
        placeObj = 2;
    });

    $('#placeObstacle').click(function() {
        console.log('[*] Enable: Place Obstacle');
        // set object being placed
        placeObj = 3;
    });

    $('#placeWPath').click(function() {
        console.log('[*] Enable: Place/Modify Weighted Path');
        // set object being placed
        placeObj = 4;
    });

    // reset everything (so we don't have to reload the page)
    $('#resetMap').click(function() {
        console.log('[*] Reset Everything');
        // set object being placed to nothing
        placeObj = 0;

        // re-initialize (reset) A*
        aStar_init();

        // do more stuff here to reset everything
        resetCanvas();
    });

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