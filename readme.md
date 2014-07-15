Tree Climber
============

[![Build Status](https://travis-ci.org/krusty-krab/tree-climber.svg?branch=master)](https://travis-ci.org/krusty-krab/tree-climber) [![NPM version](https://badge.fury.io/js/tree-climber.svg)](http://badge.fury.io/js/tree-climber)

Performs a traversal of a tree.
Calls a `visitor` function on each node.

Install
=======

`npm install tree-climber --save`

Usage
=====

```javascript
  var tree = require('tree-climber');

  tree.climb({
    path1: {
      node1: 'value1',
      path2: {
        node2: 'value2',
        path3: {
          node3: 'value3'
        }
      }
    }
  }, visitor);

  function visitor (key, value, path) {};
  // Calls to visitor will be:
  // 'node1', 'value1', 'path1.node1'
  // 'node2', 'value2', 'path1.path2.node2'
  // 'node3', 'value3', 'path1.path2.path3.node3'

  tree.climbAsync({
    path1: {
      node1: 'value1',
      path2: {
        node2: 'value2',
        path3: {
          node3: 'value3'
        }
      }
    }
  }, visitorAsync);

  function visitorAsync (key, value, path) {
    console.log(arguments);
    return Promise.resolve('foo');
  }

  // Calls to visitor will be:
  // 'node1', 'value1', 'path1.node1'
  // 'node2', 'value2', 'path1.path2.node2'
  // 'node3', 'value3', 'path1.path2.path3.node3'

```

tree.climb(obj, visitor, sep)
========================

* `obj` {Array|Object} The "tree" to visit each node on.
* `visitor` {Function} Called when visiting a node.
    * `key` {String} The key of this node.
    * `value` {Mixed} The value of this node.
    * `path` {String} The full path of the tree to this node.
* `sep` {String} An optional override for the path separator. Defaults to `.`. 

tree.climbAsync(obj, visitor, sep)
=============================

* `obj` {Array|Object} The "tree" to visit each node on.
* `visitor` {Function} Called when visiting a node.
    * `key` {String} The key of this node.
    * `value` {Mixed} The value of this node.
    * `path` {String} The full path of the tree to this node.
    * return: {Promise} A promise to pend resolving other nodes in the tree on.
* `sep` {String} An optional override for the path separator. Defaults to `.`.

Allows the user to perform asynchronous work on each node of the tree. Chains promises
in such a way that race conditions are avoided. As an example if there was a path a->b->c and
a->b->d, `tree.climbAsync` would wait for one of those paths to resolve before processing the other one
since they share a common ancestor.
