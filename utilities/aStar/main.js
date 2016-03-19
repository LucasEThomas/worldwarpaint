"use strict";

$(document).ready(function() {

    /* TODO
    - disable place buttons while algorithm is running or when algorithm has started
    - except allow the reset button to stop the algorithm and reset the map
    */

    var gridWidth = 36;
    var gridHeight = 18;

    var graph = new NodeGraph(gridWidth, gridHeight);

    var startNode = undefined; // the start node coords
    var endNode = undefined; // the end node coords

    // the queue sort operation
    var queueSort = function(a, b) {
        return a.priority - b.priority
    };

    // create global vars
    var frontier; // the queue
    var queue;
    var came_from; // track the path
    var cost_so_far; // track the path cost

    var nodes = [];
    var nodeWeights = [];

    for (var x = 0; x < gridWidth; x++) {
        for (var y = 0; y < gridHeight; y++) {
            nodes.push([x, y]);
            nodeWeights[[x, y]] = 0;
        }
    }

    graph.setNodes(nodes);
    graph.setWeights(nodeWeights);

    var ctod = function(node, priority) {
        // coordinate node to dictionary node (required for queue)
        var dict = {
            priority: priority,
            node: node
        };
        return dict;
    };

    function aStar_init() {
        console.log('Initializing A*...');

        // reset global vars
        console.log('   Resetting global vars...');
        frontier = [];
        queue = new PriorityQueue({
            comparator: queueSort
        });
        came_from = [];
        cost_so_far = [];
        came_from[startNode] = null;
        cost_so_far[startNode] = 0;

        // setup the first node
        console.log('   Pushing start node into the queue...');
        queue.queue(ctod(startNode, 0));
        frontier.push(startNode);
        not_run = false;

        console.log('Initialization complete');
    }

    function aStar_step() {
        console.log('Step through the queue...');
        // if the queue is not empty
        if (queue.length > 0) {
            console.log('   Get the first item...');
            // grab the first node in the queue
            var currentNode = queue.dequeue().node;

            if (currentNode.equals(endNode)) {
                console.log('Found end node - STOP searching');
                queue.clear();

                // since we've reached the end, draw the path
                var iterate = endNode;
                while (!iterate.equals(startNode)) {
                    if (!iterate.equals(endNode)) {
                        // get direction of other node
                        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                        // create a variable to store neighbor nodes
                        var result = [];
                        // iterate through each direction
                        dirs.forEach(function(dir, ind, arr) {
                            // get the possible neighbor's coordinates
                            var neighbor = [iterate[0] + dir[0], iterate[1] + dir[1]];
                            console.log('Iterate: ' + iterate + ', ' + neighbor);
                            if (came_from[iterate].equals(neighbor)) {
                                drawDirArrow(iterate[0], iterate[1], ind);
                            }
                        });
                    }
                    iterate = came_from[iterate];
                }

                return;
            } else if (!currentNode.equals(startNode)) {
                drawSquare(currentNode[0], currentNode[1], 'aqua');
            }

            // iterate through the node's neighbors
            console.log('   Iterate Neighbors:');
            graph.neighbors(currentNode).forEach(function(next, ind, arr) {
                console.log('       Neighbor: ' + next);

                // get cost to use neighbor
                var new_cost = cost_so_far[currentNode] + graph.cost(next);

                console.log('         Cost: ' + new_cost);

                // if the neighbor has not been evaluated or the new cost is less than the cost so far using the neighbor
                if (cost_so_far[next] === undefined || new_cost < cost_so_far[next]) {
                    console.log('         Not evaluated OR better cost than previous evaluation');

                    // update the cost to use the neighbor so far
                    cost_so_far[next] = new_cost;

                    // get the priority value of the path through the neighbor
                    var priority = new_cost + heuristic(endNode, next);

                    console.log('         Priority: ' + priority);

                    // add the neighbor to the queue
                    queue.queue(ctod(next, priority));

                    // paint the neighbor on the map
                    if (!next.equals(endNode) && came_from[next] === undefined && !next.equals(startNode) && graph.cost(next) < 999) {
                        drawSquare(next[0], next[1], 'aquamarine');
                    }

                    // track node path
                    came_from[next] = currentNode;
                }
            });
        }

        if (queue.length > 0) {
            var peek = queue.peek().node;
            highlightNode(peek[0], peek[1]);
        }
    }

    var costTier = ['#eee', '#ddd', '#ccc', '#bbb', '#aaa', '#999'];

    function heuristic(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    var not_run = true;

    function checkStopSearching() {
        if (queue !== undefined) {
            if (queue.length === 0) {
                $('#stepNodeTimerToggle').attr('disabled', 'disabled');
                $('#stepNodeTimerToggle').text('Run');
                $('#stepNode').attr('disabled', 'disabled');
                $('#stepTimer').attr('disabled', 'disabled');
                $('#stepNumber').attr('disabled', 'disabled');
                clearInterval(nodeTimer);
                nodeTimer = undefined;
                return true;
            }
        }
        return false;
    }

    function checkStartEnd() {
        if (startNode && endNode && not_run === true) {
            $('#stepNode').removeAttr('disabled');
            $('#stepNodeTimerToggle').removeAttr('disabled');
        }
    }

    $('#stepNode').click(function() {
        if (startNode && endNode) {
            var stepNumber = $('#stepNumber').val();
            stepNumber = stepNumber > 0 ? stepNumber : 1;

            if (not_run) {
                aStar_init();
            }

            stepNumber = (!checkStopSearching()) ? stepNumber : 0;

            for (var i = 0; i < stepNumber; i++) {
                if (!checkStopSearching()) {
                    aStar_step();
                }
            }
        } else {
            console.log('Set a start node and an end node');
        }
    });

    var nodeTimer;

    $('#stepNodeTimerToggle').click(function() {
        if (not_run) {
            aStar_init();
        }
        if (nodeTimer) {
            clearInterval(nodeTimer);
            nodeTimer = undefined;
            $('#stepNode').removeAttr('disabled');
        } else {
            nodeTimer = setInterval(function() {
                checkStopSearching();
                $('#stepNode').attr('disabled', 'disabled');
                aStar_step();
            }, $('#stepTimer').val());
        }
        $(this).text(function(i, text) {
            return text === "Run" ? "Stop" : "Run";
        })
    });

    $('#randomObstacles').click(function() {
        makeObstacles();
    });

    $('#randomWeights').click(function() {
        makeWeights();
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

    // random obstacles
    function makeObstacles() {
        for (var x = 0; x < gridWidth; x++) {
            for (var y = 0; y < gridHeight; y++) {
                if (![x, y].equals(startNode) && ![x, y].equals(endNode) && graph.cost([x, y]) !== 999999 && graph.cost([x, y]) === 0) {
                    if (Math.random() < .1) {
                        drawSquare(x, y, '#000');
                        graph.setCost([x, y], 999999);
                    }
                }
            }
        }
    }

    // random weights
    function makeWeights() {
        for (var x = 0; x < gridWidth; x++) {
            for (var y = 0; y < gridHeight; y++) {
                if (![x, y].equals(startNode) && ![x, y].equals(endNode) && graph.cost([x, y]) !== 999999 && graph.cost([x, y]) === 0) {
                    if (Math.random() < .08) {
                        var weight = Math.floor(Math.random() * (6 - 1)) + 1
                        drawSquare(x, y, costTier[weight]);
                        graph.setCost([x, y], weight);
                    }
                }
            }
        }
    }

    // call resetCanvas on page load
    resetCanvas();

    /* current type of object we are placing on the map
    // 0 = nothing
    // 1 = start
    // 2 = end
    // 3 = inpassable object (it's actually passable as a last resort)
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

                        // unmark the previous start node on the canvas
                        if (startNode) {
                            drawSquare(startNode[0], startNode[1], '#eee');
                        }

                        // set the start node to the new position
                        startNode = clickPos;

                        // mark the new start node on the canvas
                        drawSquare(clickPos[0], clickPos[1], 'chartreuse');

                        // turn off start object placement
                        placeObj = 0;
                        checkStartEnd();
                        break;
                    case 2:
                        // disallow placing over start node
                        if (startNode) {
                            if (startNode.equals(clickPos)) {
                                break;
                            }
                        }

                        // unmark the previous end node on the canvas
                        if (endNode) {
                            drawSquare(endNode[0], endNode[1], "#eee");
                        }

                        // set the end node to the new position
                        endNode = clickPos;

                        drawSquare(clickPos[0], clickPos[1], 'crimson');
                        // turn off end object placement
                        placeObj = 0;
                        checkStartEnd();
                        break;
                    case 3:
                        if (graph.cost(clickPos) === 999999) {
                            graph.setCost(clickPos, 0);
                            drawSquare(clickPos[0], clickPos[1], '#eee');
                        } else {
                            graph.setCost(clickPos, 999999);
                            drawSquare(clickPos[0], clickPos[1], 'black');
                        }
                        break;
                    case 4:
                        if (startNode) {
                            if (startNode.equals(clickPos)) {
                                break;
                            }
                        } else if (endNode) {
                            if (endNode.equals(clickPos)) {
                                break;
                            }
                        }

                        // get currrent node cost
                        var curCost = graph.cost(clickPos);
                        if (curCost < 5) {
                            graph.setCost(clickPos, curCost + 1);
                            drawSquare(clickPos[0], clickPos[1], costTier[curCost + 1]);
                        }
                        break;
                }
                break;
                // \/ right mouse click \/
            case 3:
                if (placeObj === 4) {
                    if (startNode) {
                        if (startNode.equals(clickPos)) {
                            break;
                        }
                    } else if (endNode) {
                        if (endNode.equals(clickPos)) {
                            break;
                        }
                    }

                    // decrease weight of path
                    // get currrent node cost
                    var curCost = graph.cost(clickPos);
                    if (curCost > 0) {
                        graph.setCost(clickPos, curCost - 1);
                        drawSquare(clickPos[0], clickPos[1], costTier[curCost - 1]);
                    }
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

    // reset the pathfinding
    $('#resetMap').click(function() {
        // first reset the canvas
        resetCanvas();

        // then reset everything else
        not_run = true; // this will force aStar_init() to run

        // now redraw with the current map values
        for (var x = 0; x < gridWidth; x++) {
            for (var y = 0; y < gridHeight; y++) {
                if ([x, y].equals(startNode)) {
                    drawSquare(x, y, 'chartreuse');
                    graph.setCost([x, y], 0);
                } else if ([x, y].equals(endNode)) {
                    drawSquare(x, y, 'crimson');
                    graph.setCost([x, y], 0);
                } else if (graph.cost([x, y]) === 999999) {
                    drawSquare(x, y, 'black');
                } else if (graph.cost([x, y]) > 0) {
                    drawSquare(x, y, costTier[graph.cost([x, y])]);
                }
            }
        }

        $('#stepNodeTimerToggle').removeAttr('disabled');
        $('#stepNode').removeAttr('disabled');
        $('#stepTimer').removeAttr('disabled');
        $('#stepNumber').removeAttr('disabled');
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