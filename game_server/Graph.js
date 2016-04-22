"use strict";

class NodeGraph {
    constructor(w, h) {
        this.width = w - 1;
        this.height = h - 1;
        this.walls = [];
        this.weights = [];
    }

    setNodes(n) {
        this.nodes = n;
    }

    setWeights(w) {
        this.weights = w;
    }

    setCost(node, cost) {
        this.weights[node] = cost;
    }

    cost(node) {
        return this.weights[node];
    }

    boundable(node) {
        return 0 <= node[0] && node[0] <= this.width && 0 <= node[1] && node[1] <= this.height;
    }

    passable(node) {
        var pass = this.walls.some(function(val, ind, arr) {
            if (val.equals(node)) {
                return true;
            }
        });
        // passable if cost is less than 999,999
        return (this.cost(node) < 999999) ? !pass : pass;
    }

    neighbors(node) {
        var x = node[0];
        var y = node[1];
        var results = [
                [x + 1, y],
                [x, y - 1],
                [x - 1, y],
                [x, y + 1]
            ];
        // aesthetics?
        if ((x + y) % 2 === 0) {
            results.reverse();
        }
        results = results.filter(this.boundable, this);
        results = results.filter(this.passable, this);
        return results;
    }
}

module.exports = NodeGraph;