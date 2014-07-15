'use strict';

var climber = require('../lib/climber');
var Promise = require('promise');

describe('climbing trees', function () {
  var visitor;

  beforeEach(function () {
    visitor = jasmine.createSpy('visitor');
  });

  it('should be an object', function () {
    expect(climber).toEqual(jasmine.any(Object));
  });

  describe('climb', function () {
    var climb;

    beforeEach(function () {
      climb = climber.climb;
    });

    it('should be a function', function () {
      expect(climb).toEqual(jasmine.any(Function));
    });

    it('should call the visitor with key, value, and path', function () {
      climb({
        a: 'b'
      }, visitor);

      expect(visitor).toHaveBeenCalledWith('a', 'b', 'a');
    });

    it('should visit deeper paths', function () {
      climb({
        a: {
          b: 'c'
        }
      }, visitor);

      expect(visitor).toHaveBeenCalledWith('b', 'c', 'a.b');
    });

    it('should traverse arrays', function () {
      climb([
        {
          a: {
            b: 'c'
          }
        }
      ], visitor);

      expect(visitor).toHaveBeenCalledWith('b', 'c', '0.a.b');
    });

    it('should handle complex trees', function () {
      climb({
        stuff: [
          {
            things: [
              {},
              {
                foo: 'bar'
              }
            ]
          }
        ]
      }, visitor);

      expect(visitor).toHaveBeenCalledWith('foo', 'bar', 'stuff.0.things.1.foo');
    });

    it('should handle empty arrays', function () {
      climb([], visitor);

      expect(visitor).not.toHaveBeenCalled();
    });

    it('should handle empty objects', function () {
      climb({}, visitor);

      expect(visitor).not.toHaveBeenCalled();
    });

    it('should do a pre-order traversal', function () {
      climb({
        foo: {
          bam: 'blah',
          bar: {
            baz: 'bat',
            more: {
              stuff: 'here'
            }
          }
        }
      }, visitor);

      expect(visitor.calls.allArgs()).toEqual([
        ['bam', 'blah', 'foo.bam' ],
        [ 'baz', 'bat', 'foo.bar.baz' ],
        ['stuff', 'here', 'foo.bar.more.stuff']
      ]);
    });

    it('should let the sep be overridden', function () {
      climb([
        {
          a: {
            b: 'c'
          }
        }
      ], visitor, '/');

      expect(visitor).toHaveBeenCalledWith('b', 'c', '0/a/b');
    });

    it('should throw if a cycle is detected', function () {
      var obj = {
        a: {
          b: 'c'
        }
      };

      obj.a.obj = obj;

      expect(shouldThrow).toThrow(new TypeError('Cycle detected.'));

      function shouldThrow () {
        climb(obj, visitor);
      }
    });

    it('should throw if a separator is used in the key', function () {
      var obj = {
        'a.b': {
          c: 'd'
        }
      };

      expect(shouldThrow).toThrow(new Error('Key cannot contain a . character.'));

      function shouldThrow () {
        climb(obj, visitor);
      }
    });
  });
});

describe('climbAsync', function () {
  var climbAsync, obj, complexObj, visited;

  beforeEach(function () {
    climbAsync = climber.climbAsync;
    visited = [];

    obj = {
      a: {
        b: {
          c: 'c value',
          d: 'd value',
          e: 'e value'
        }
      }
    };

    complexObj = {
      z: {
        x: {
          f: 'f value'
        },
        y: {
          g: {
            h: 'h value'
          },
          m: 'm value'
        },
        q: 'q value',
        r: 'r value',
        s: 's value',
        arr: ['t', 'u', 'v']
      },
      b: {
        c: 'c value',
        d: 'd value',
        e: 'e value'
      },
      v: 'v value'
    };
  });

  it('should be a function', function () {
    expect(climbAsync).toEqual(jasmine.any(Function));
  });

  it('should visit all the nodes', function (done) {
    climbAsync(obj, function visitor (key) {
      visited.push(key);

      return Promise.resolve('whatever');
    })
      .then(function checkVisited () {
        expect(visited).toEqual(['c', 'd', 'e']);
      })
      .done(done);
  });

  it('should reject if a separator character is used in a key', function (done) {
    var obj = {
      'a.b': {
        c: 'd'
      }
    };

    climbAsync(obj, function visitor () {
      return Promise.resolve('whatever');
    })
      .catch(function checkVisited (error) {
        expect(error).toEqual(new Error('Key cannot contain a . character.'));
      })
      .done(done);
  });

  it('should visit all the nodes of a complex object in dependency order', function (done) {
    climbAsync(complexObj, function visitor (key) {
      visited.push(key);

      return Promise.resolve('whatever');
    })
      .then(function checkVisited () {
        expect(visited).toEqual([ 'f', 'h', 'q', 'r', 's', '0', 'c', 'v', 'm', '1', '2', 'd', 'e' ]);
      })
      .done(done);
  });

  it('should register f\'s common ancestors after f is done', function (done) {
    var promise = Promise.resolve('f');

    climbAsync(complexObj, function visitor (key) {
      visited.push(key);

      if (key === 'f')
        return promise;
      else
        return new Promise (function () {});
    });

    promise.then(function () {
      expect(visited).toEqual([ 'f', 'h', 'q', 'r', 's', '0', 'c', 'v' ]);
    })
      .done(done);
  });

  it('should not visit any other nodes until f is resolved', function (done) {
    var promise = Promise.resolve('f');

    climbAsync(complexObj, function visitor (key) {
      visited.push(key);

      if (key === 'f')
        return new Promise(function () {});
      else
        return promise;
    });

    promise.then(function () {
      expect(visited).toEqual(['f']);
    })
      .done(done);
  });

  it('should not visit any other nodes if f is rejected', function (done) {
    climbAsync(complexObj, function visitor (key) {
      visited.push(key);

      if (key === 'f')
        return new Promise(function (resolve, reject) {
          reject();
        });
      else
        return Promise.resolve('foo');
    })
      .catch(function () {
        expect(visited).toEqual(['f']);
      })
      .done(done);
  });
});
