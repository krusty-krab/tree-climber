Tree Climber
============

Performs a traversal of a tree.
Calls a `visitor` function on each node.

Install
=======

`npm install tree-climber --save`

Example
=======

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
```
