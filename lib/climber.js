'use strict';

var isPlainObject = require('lodash.isplainobject');
var Promise = require('promise');

module.exports = {
  climb: climb,
  climbAsync: climbAsync
};

/**
 * Does a pre-order traversal of the tree.
 * Is synchronous
 * @param {Object|Array} tree
 * @param {Function} visitor
 */
function climb (tree, visitor) {
  var visited = [];

  (function climber (value, key, path) {
    if (isNode(value)) {
      visitor(key, value, path);
    } else {
      if (visited.indexOf(value) >= 0)
        throw new TypeError('Cycle detected.');
      visited.push(value);

      edgeTraverser(value, function handleEdge (childValue, key) {
        climber(childValue, key, calculatePath(path, key));
      });
    }
  }(tree));
}

/**
 * Does a traversal of the tree.
 * Wires all the nodes together to form a dependency chain.
 * The purpose of this is to allow concurrency and avoid race
 * conditions in common ancestors.
 *
 * Each visitor should return a promise to pend on.
 * @param {Object} tree
 * @param {Function} visitor
 * @returns {Promise} A promise fulfilled when all nodes have been resolved.
 */
function climbAsync (tree, visitor) {
  var allPromises = [];
  var paths = {};

  climb(tree, function (key, value, path) {
    var boundVisitor = visitor.bind(null, key, value, path);
    var pathParts = path.split('.').slice(0, -1);
    pathParts.unshift('_ROOT');
    var pathToNode = pathParts.join('.');
    var newPromise;

    Object.keys(paths).sort(sorter).some(function chainOffSlot (storedPath) {
      var containsPath = pathToNode.indexOf(storedPath) === 0;

      if (containsPath)
        newPromise = paths[storedPath].then(boundVisitor);

      return containsPath;
    });

    pathParts.reduce(function fillEmptySlots (currentPath, part) {
      currentPath = (!currentPath ? part : [currentPath, part].join('.'));

      if (!paths[currentPath])
        paths[currentPath] = newPromise || (newPromise = boundVisitor());

      return currentPath;
    }, null);

    /**
     * Sorts the paths from longest to shortest.
     * @param {String} a
     * @param {String} b
     * @returns {Number}
     */
    function sorter (a, b) {
      return getPathLength(b) - getPathLength(a);
    }

    /**
     * Returns the number of path separators (.) in a string
     * @param {String} path
     * @returns {Number}
     */
    function getPathLength (path) {
      return path.split('.').length;
    }

    allPromises.push(newPromise);
  });

  return Promise.all(allPromises);
}

/**
 * Given a path and key, returns the new path.
 * @param {String} path
 * @param {String} key
 * @returns {String}
 */
function calculatePath (path, key) {
  if (!path)
    return key;
  else
    return path + '.' + key;
}

/**
 * Is this value a node
 * @param {*} value
 * @returns {boolean}
 */
function isNode (value) {
  return !isPlainObject(value) && !Array.isArray(value);
}

/**
 * Calls a callback for each path.
 * Normalizes path traversal for Objects and Arrays.
 * @param {*} value
 * @param {Function} callback
 */
function edgeTraverser (value, callback) {
  if (isPlainObject(value))
    Object.keys(value).forEach(function (key) {
      callback(value[key], key);
    });
  else if (Array.isArray(value))
    value.forEach(function (val, key) {
      key = key.toString();
      callback(val, key);
    });
}
