'use strict';

var climb = require('../lib/climb');

describe('climbing trees', function () {
  var visitor;

  beforeEach(function () {
    visitor = jasmine.createSpy('visitor');
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
});
