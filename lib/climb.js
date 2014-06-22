'use strict';

var isPlainObject = require('lodash.isplainobject');

module.exports = function climb (tree, visitor) {
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
};

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
