'use strict';

var tree = require('../index');

describe('index', function () {
  it('should expose a climb method', function () {
    expect(tree.climb).toEqual(jasmine.any(Function));
  });

  it('should be able to climb a tree', function () {
    var visitor = jasmine.createSpy('visitor');

    tree.climb({
      a: 'b'
    }, visitor);

    expect(visitor).toHaveBeenCalledWith('a', 'b', 'a');
  });
});

