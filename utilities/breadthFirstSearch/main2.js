// can delete this, mostly test code and probably fairly buggy
// main.js is the result of the testing in this file
$(document).ready(function() {
    // this is an array of nodes, format is [[x0,y0],[x0,y1], ...]
    var nodes = [];
    var start, end;

    var xSize = 13;
    var ySize = 23;

    // generate a table array of values (xy coordinates)
    // each coordinate will be a cell in the table
    // this is a grid of nodes, format is x0[y0, y1, ...]
    var map = [];
    // fill in the map and node arrays
    for (var x = 0; x < xSize + 1; x++) {
        var row = [];
        for (var y = 0; y < ySize + 1; y++) {
            row.push(0);
            nodes.push([x, y]);
        }
        map.push(row);
    }
    // pick a random start location
    var curRiverPos = {
        x: Math.rangeInt(0, xSize),
        y: Math.rangeInt(0, ySize)
    };
    // pick a random end location
    var endRiverPos = {
        x: Math.rangeInt(0, xSize),
        y: Math.rangeInt(0, ySize)
    };
    map[curRiverPos.x][curRiverPos.y] = 1;
    map[endRiverPos.x][endRiverPos.y] = 2;
    // draw the map
    drawMap(map);

    // run the search algorithm
    start = [curRiverPos.x, curRiverPos.y];
    //console.log(start);
    end = [endRiverPos.x, endRiverPos.y];
    //console.log(end);
    //search(start, end);
    //console.log(neighbors([curRiverPos.x, curRiverPos.y]));

    $('#step').click(function() {
        stepSearch(start, end);
    });

    search(start, end);

    // get node's neighbor(s)
    function neighbors(node) {
        // these are the directions we check
        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        // store the list of resulting neighbors
        var result = [];
        // iterate through each possible direction
        dirs.forEach(function(dir, i, arr) {
            // get the possible neighbor's coordinates
            var neighbor = [node[0] + dir[0], node[1] + dir[1]];
            // if neighbor coordinates are withing map bounds
            if (0 <= neighbor[0] && neighbor[0] <= xSize && 0 <= neighbor[1] && neighbor[1] <= ySize) {
                // if neighbor is (still) in the all nodes list
                if (nodes.indexOf(neighbor)) {
                    // add the neighbor coordinates to the result array
                    result.push(neighbor);
                }
            }
        });
        return result;
    }

    // create queue
    var frontier = [];
    // push start node to queue
    frontier.push(start);
    console.log(start);
    // create came_from list
    var came_from = [];
    // add start node with null from to came_from list
    came_from[start] = null;
    var trackIteration = 1;

    function stepSearch(start, end) {
        if (frontier.length > 0) {
            //console.log("  "+frontier.length+" nodes still in queue")
            console.log(' Queue iteration #' + trackIteration + ' - size of queue is ' + frontier.length);
            // current node = first in queue
            var current = frontier.shift();
            console.log("   Current node is " + current);
            // if current node is = end node
            if (current.equals(end)) {
                console.log("   STOP - reached end node");
                $('#c' + end[0] + end[1]).attr("class", "end");
                frontier = [];
                // break loop
                return;
            }

            console.log('   Iterate neighbors');
            // foreach neighbor (next) of current
            neighbors(current).forEach(function(next, ind, arr) {
                console.log('     Neighbor: ' + next);
                // if next is not in came_from
                if (came_from[next] !== null && came_from[next] === undefined) {
                    // add next to queue
                    frontier.push(next);
                    // add next to came_from with current as from
                    came_from[next] = current;
                    if (!next.equals(end)) {
                        $('#c' + next[0] + next[1]).attr("class", "neighbor");
                    }
                }
            });
            trackIteration++;
        }
    }

    function search(start, end) {
        //console.log('Starting search...');
        //console.log('  Starting node: ' + start);
        //console.log('  Ending node:   ' + end);

        // create queue
        var frontier = [];
        // push start node to queue
        frontier.push(start);
        // create came_from list
        var came_from = [];
        // add start node with null from to came_from list
        came_from[start] = null;

        //console.log('  Begin iterating through queue');

        var trackIteration = 1;

        // while something is in queue
        while (frontier.length > 0) {
            //console.log('   Queue iteration #' + trackIteration + ' - size of queue is ' + frontier.length);
            // current node = first in queue
            var current = frontier.shift();
            // if current node is = end node
            if (current.equals(end)) {
                $('#c' + end[0] + end[1]).attr("class", "end");
                // break loop
                break;
            }

            // foreach neighbor (next) of current
            neighbors(current).forEach(function(next, ind, arr) {
                // if next is not in came_from
                if (came_from[next] !== null && came_from[next] === undefined) {
                    // add next to queue
                    frontier.push(next);
                    // add next to came_from with current as from
                    came_from[next] = current;
                    $('#c' + next[0] + next[1]).attr("class", "neighbor");
                }
            });
            trackIteration++;
        }
    }

    function testSearch(start, end) {
        console.log("-------------------------------");
        console.log("Start node: ");
        console.log(start);
        var frontier = [];
        frontier.push(start);
        console.log("Start of the frontier: ");
        console.log(frontier);
        var from = [];
        from[start] = null;
        console.log(from);
        console.log("Coming from: null");
        console.log("Begin iterating the frontier")
        while (frontier.length > 0) {
            //for (var z = 0; z < 2; z++) {
            console.log("  Iterating frontier... (" + frontier.length + ")");

            var current = frontier.shift();

            console.log("   After queue shift... (" + frontier.length + ")");

            console.log("    Current node: ");
            console.log(current);
            console.log("    End node: ");
            console.log(end);
            if (current.equals(end)) {
                console.log("End of the frontier");
                $('#c' + end[0] + end[1]).attr("class", "end");
                break;
            } else {
                console.log("not the end");
            }

            console.log("      Iterate through neighbors");
            var neighborNodes = neighbors(current);
            console.log("      neighbors: " + neighborNodes);
            neighborNodes.forEach(function(next, ind, arr) {
                console.log("       iteration: neighbor #" + ind);
                console.log("        Neighbor: " + next);
                console.log("from exists: " + from[next]);
                if (from[next] !== null) {
                    console.log("            NOT visited neighbor");
                    console.log("            Adding neighbor to frontier");
                    frontier.push(next);
                    console.log("            New frontier: ");
                    console.log(frontier);
                    from[next] = current;
                    console.log('--begin from--');
                    console.log(from);
                    console.log('--end from----');
                    $('#c' + next[0] + next[1]).attr("class", "neighbor");
                } else {
                    console.log("            Visited neighbor");
                    console.log("            Not adding to frontier");
                }
            });
            /*neighbors(current).forEach(function(next, ind, arr) {
                if (from.indexOf(next) === -1) {
                    frontier.push(next);
                    from[next] = current;
                }
            });*/
        }
        console.log("From: ");
        console.log(from);
        console.log("Frontier: ");
        console.log(frontier);
    }

    // redraw entire map
    function drawMap(map) {
        // generate map html
        var mapHTML = "<table>";
        map.forEach(function(val, x, arr) {
            mapHTML += "<tr>";
            val.forEach(function(val, y, arr) {
                var colType = 'empty';
                if (val === 1) {
                    colType = 'start';
                } else if (val === 2) {
                    colType = 'end';
                } else if (val === 3) {
                    colType = 'path';
                }
                mapHTML += "<td id=\"c" + x + y + "\" class=\"" + colType + "\">" + "</td>";
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