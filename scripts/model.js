/*
 * Class and function definitions that fuel the generation of maze data.
 * Written by Michael Wheeler.
 */

/**
 * A location in the grid. Allows specification of units as a string (e.g.: "inches" or "cells").
 * Coordinates are zero-indexed, so the square at the origin is (0, 0, "cells").
 */
class Coordinate {
    constructor (x, y, unit) {
        this.x = x;
        this.y = y;
        this.unit = unit;
    }

    /**
     * Concatenates the x and y values as strings, with units and a comma in between.
     * @returns {string}
     */
    toString() {
        return this.x.toString() + this.unit + "," + this.y.toString() + this.unit;
    }
}

/**
 * Represents a cell in the maze, and a node in the graph/spanning tree.
 */
class Node {
    constructor(x, y) {
        this.coordinate = new Coordinate(x, y, "cells");
    }

    /**
     * Returns the string representation of the Node's coordinate.
     * @returns {string}
     */
    toString() {
        return this.coordinate.toString();
    }

    /**
     * Returns the coordinates of potential neighbors to this Node (not considering Nodes excluded from the Graph)
     * @param maxX The horizontal limit after which Nodes don't exist (ie the width of the grid)
     * @param maxY The vertical limit after which Nodes don't exist (ie the height of the grid)
     */
    getNeighboringCoords(maxX, maxY) {
        let neighbors =[];
        let deltas = [-1, 1];
        for (let dx of deltas) {
            let newX = this.coordinate.x + dx;

            if (newX >= 0 && newX < maxX) {
                neighbors.push(new Coordinate(newX, this.coordinate.y, this.coordinate.unit));
            }
        }
        for (let dy of deltas) {
            let newY = this.coordinate.y + dy;

            if (newY >= 0 && newY < maxY) {
                neighbors.push(new Coordinate(this.coordinate.x, newY, this.coordinate.unit));
            }
        }
        return neighbors;
    }
}

/**
 * A connection between two Nodes.
 */
class Edge {
    constructor(node1, node2) {
        if (!(node1 instanceof Node) || !(node2 instanceof Node))
            throw Error("Attempted to create Edge between non-Nodes!");
        this.node1 = node1;
        this.node2 = node2;
    }

    /**
     * Creates an Edge in the opposite direction as this Edge.
     * @returns {Edge}
     */
    reverse() {
        return new Edge(this.node2, this.node1);
    }

    /**
     * Returns the string representation of the two Nodes, separated by an arrow.
     * @returns {string}
     */
    toString() {
        return this.node1.toString() + "->" + this.node2.toString();
    }

    isHorizontal() {
        return (Math.abs(this.node1.coordinate.x - this.node2.coordinate.x) === 1);
    }

    isVertical() {
        return (Math.abs(this.node1.coordinate.y - this.node2.coordinate.y) === 1);
    }

    getWidth() {
        if (this.isHorizontal()) {
            return CELL_WIDTH_PIXELS + EDGE_WIDTH_PIXELS;
        } else if (this.isVertical()) {
            return EDGE_WIDTH_PIXELS;
        } else {
            throw Error("Edge is neither vertical nor horizontal. (???)")
        }
    }

    getHeight() {
        if (this.isHorizontal()) {
            return EDGE_WIDTH_PIXELS;
        } else if (this.isVertical()) {
            return CELL_WIDTH_PIXELS + EDGE_WIDTH_PIXELS;
        } else {
            throw Error("Edge is neither vertical nor horizontal. (???)")
        }
    }

    getX() {
        return Math.min(this.node1.coordinate.x, this.node2.coordinate.x)
            * CELL_WIDTH_PIXELS + 4;
    }

    getY() {
        return Math.min(this.node1.coordinate.y, this.node2.coordinate.y)
            * CELL_WIDTH_PIXELS + 4;
    }
}

/**
 * A collection of Nodes and Edges.
 */
class Graph {
    constructor() {
        // Hashes are used here for constant-time lookup.
        this.nodes = {};
        this.edges = {};
    }

    /**
     * Checks whether a matching node exists in this graph.
     * @param node Can be either a Node or its string representation.
     * @returns {boolean}
     */
    hasNode(node) {
        // Check that argument is in fact a node or a string
        if (!(node instanceof Node) && !(typeof node === "string"))
            throw Error("Argument is neither a node nor a string!");

        return this.nodes.hasOwnProperty(node);
    }

    /**
     * Checks whether an edge in either direction exists in this graph.
     * @param node1 can be either a Node or its string representation.
     * @param node2 can be either a Node or its string representation.
     * @returns {boolean}
     */
    hasEdge(node1, node2) {
        // Check that arguments are in fact nodes or strings that match nodes
        if (!(node1 instanceof Node) && !(typeof node1 === "string"))
            throw Error("First argument is neither a node nor a string!");
        if (!(node2 instanceof Node) && !(typeof node2 === "string"))
            throw Error("Second argument is neither a node nor a string!");

        // Check that nodes do in fact belong to graph
        if (!(this.hasNode(node1))) throw Error("First node does not belong to the graph! " + node1.toString());
        if (!(this.hasNode(node2))) throw Error("Second node does not belong to the graph! " + node2.toString());

        // Convert any strings to nodes before making edges
        if (typeof node1 === "string") node1 = this.getNode(node1);
        if (typeof node2 === "string") node2 = this.getNode(node2);

        // Make dummy edges to get their keys in the hash table
        let edgeHash = new Edge(node1, node2).toString();
        let edgeHashReverse = new Edge(node2, node1).toString();

        // Check those hash keys against the hash table
        return this.edges.hasOwnProperty(edgeHash) || this.edges.hasOwnProperty(edgeHashReverse);

    }

    /**
     * Adds a new (edgeless) node to the graph.
     * @param node must be a Node object. Can NOT be the String representation of a Node.
     */
    addNode(node) {
        // Check that argument is in fact a node
        if (!(node instanceof Node)) throw new Error("Attempted to add non-Node to the graph!");
        // Check that the graph does not already have this node
        if (this.hasNode(node)) throw new Error("Graph already has node " + node.toString());

        this.nodes[node] = node;
    }

    /**
     * Adds a new Edge to the graph between two existing nodes.
     * @param node1 must be a Node object. Can NOT be the String representation of a Node.
     * @param node2 must be a Node object. Can NOT be the String representation of a Node.
     */
    addEdge(node1, node2) {
        // Check that arguments are in fact nodes
        if (!(node1 instanceof Node)) throw Error("First argument is not a node! " + node1.toString());
        if (!(node2 instanceof Node)) throw Error("Second argument is not a node! " + node2.toString());

        // Check that the graph does not already have this edge
        if(this.hasEdge(node1, node2)) throw new Error("Graph already has this edge!");

        let edge = new Edge(node1, node2);
        this.edges[edge] = edge;
    }

    /**
     * Provides all the nodes in this graph.
     * @returns {Node[]}
     */
    getAllNodes() {
        return Object.values(this.nodes);
    }

    /**
     * Provides all the edges in this graph.
     * @returns {Edge[]}
     */
    getAllEdges() {
        return Object.values(this.edges);
    }

    /**
     * Returns a specific node in the graph, or throws an error if not found.
     * @param key The key for that node in the hash table -- a Coordinate object or a String.
     * @returns {Node}
     */
    getNode(key) {
        // Check that argument is in fact a coordinate or a string
        if (!(key instanceof Coordinate) && !(typeof key === "string"))
            throw Error("Argument is neither a coordinate nor a string!");

        // FIXME -- throw error if node not found
        return this.nodes[key];
    }
}

/**
 * A data structure used to track non-overlapping subsets in the graph. Used to form an MST of the grid.
 */
class DisjointSetForest {

    constructor() {
        this.nodes = {};
        this.parents = {};
        this.ranks = {}
    }

    /**
     * Makes a new empty set and adds it to the Disjoint Set forest.
     * @param node
     */
    makeSet(node) {
        this.nodes[node] = node;
        this.parents[node] = node;  // Make this node the representative member of its own set.
        this.ranks[node] = 0;  // Rank is used to control the height of the tree as union() gets applied
    }

    /**
     * Finds the representative element of the set to which our input belongs.
     * @param node
     * @returns {Node}
     */
    find(node) {
        let nodeKey = node.toString();
        let nextKey = "";

        while (this.parents[nodeKey] !== nodeKey) {
            nextKey = this.parents[nodeKey];
            this.parents[nodeKey] = this.parents[nextKey];
            nodeKey = nextKey;
        }

        return this.nodes[nodeKey];
    }

    /**
     * Combines two disjoint sets by setting one representative element as the parent of the other.
     * @param node1
     * @param node2
     */
    union(node1, node2) {
        // Find the representative elements of each node
        let root1 = this.find(node1);
        let root2 = this.find(node2);

        // If they're already members of the same set then stop
        if (root1 === root2) {
            return;
        }

        // Otherwise make sure root1 is the one with the biggest rank
        if (this.ranks[root1] < this.ranks[root2]) {
            let temp = root1;
            root1 = root2;
            root2 = temp;
        }

        // Then merge the set of lower rank into the one wth higher rank
        this.parents[root2] = root1.toString();

        // And if both ranks are equal increment by one
        if (this.ranks[root1] === this.ranks[root2]) {
            this.ranks[root1] = this.ranks[root1] + 1;
        }
    }
}

/**
 * Generates a minimum spanning tree for the given graph.
 * @param graph
 * @returns {Graph}
 */
function doKruskals(graph) {
    let tree = new Graph();
    let unionFind = new DisjointSetForest();

    for (let node of graph.getAllNodes()) {
        tree.addNode(node);  // Add that node to our tree (for now it has no edges)
        unionFind.makeSet(node);  // Also add it to the the disjoint set forest
    }

    let edges = graph.getAllEdges();

    while (edges.length > 0) {
        let edge = edges.splice(Math.floor(Math.random()*edges.length), 1)[0];
        let node1 = edge.node1;
        let node2 = edge.node2;
        // If the two nodes don't belong to the same set
        if (unionFind.find(node1) !== unionFind.find(node2)) {
            tree.addEdge(node1, node2);  // Add that edge to the tree
            unionFind.union(node1, node2);  // And union the two sets together
        }
    }

    return tree;
}