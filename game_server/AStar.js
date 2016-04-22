"use strict";
var Utility = require('./Utility.js');
var NodeGraph = require('./Graph.js');
var PriorityQueue = require('./PriorityQueue.js');

class AStar {
    constructor(mapWidth, mapHeight, startNode, endNode, nodeWeights) {
        // call A* algorithm given a start node, end node, weight costs (if applicable), and impassable nodes
        // nodeWeights is an array matching the map, with the value being the weight

        // create the graph
        var graph = new NodeGraph(mapWidth, mapHeight);

        // priority queue sort function
        var queueSort = function(a, b) {
            return a.priority - b.priority;
        }

        // initialize the priority queue
        var queue = new PriorityQueue({
            comparator: queueSort
        });

        // track the path
        var came_from = [];

        // track path cost
        var cost_so_far = [];

        // hold all the nodes
        var nodes = [];

        // pass the nodes and their weights to the graph
        graph.setNodes(nodes);
        graph.setWeights(nodeWeights);

        // conversion function to convert coord node to dict node
        var ctod = function(node, priority) {
            // coordinate node to dictionary node (required for queue)
            var dict = {
                priority: priority,
                node: node
            };
            return dict;
        };

        // distance heuristic function
        function heuristic(a, b) {
            return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        }

        // pass the startNode to the queue and setup the tracking starting with it
        came_from[startNode] = null;
        cost_so_far[startNode] = 0;
        queue.queue(ctod(startNode, 0));

        // start the search!
        while (queue.length > 0) {
            var currentNode = queue.dequeue().node;

            // is this the end node?
            if (currentNode.equals(endNode)) {
                // yes, empty the queue first
                queue.clear();

                // now get the path put together and then return it out
                return {
                    success: true,
                    path: came_from
                };
            }

            // iterate through the node's neighbors
            graph.neighbors(currentNode).forEach(function(next, ind, arr) {
                // get cost to use the neighbor
                var new_cost = cost_so_far[currentNode] + graph.cost(next);

                // if the neighbor has not been evaluated OR the new cost is less than the cost last evaluated with this neighbor through a different path
                if (cost_so_far[next] === undefined || new_cost < cost_so_far[next]) {
                    // update the cost to use the neighbor this route
                    cost_so_far[next] = new_cost;

                    // get the priority value of the path through the neighbor
                    var priority = new_cost + heuristic(endNode, next);

                    // add the neighbor to the queue
                    queue.queue(ctod(next, priority));

                    // track node path
                    came_from[next] = currentNode;
                }
            });
        }

        // this only happens if a path can't be found, e.g. blocked off by impassable nodes
        return {
            success: false,
            path: came_from
        };
    }
}

module.exports = AStar;