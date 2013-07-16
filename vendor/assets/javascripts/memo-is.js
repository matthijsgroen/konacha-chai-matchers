/*
 * node-memo-is.
 * Copyright © 2012 Chris Corbyn.
 *
 * See LICENSE file for details.
 */

/**
 * Memoization context housing a stack of memoizer callbacks.
 *
 * An initial memoizer function is created by calling #is() on the Memoizer
 * then the function can be overridden by calling #is() on that memoizer
 * etc, as many times as required.
 *
 * The memoizer function is only available inside of before()/after() and it()
 * contexts.
 *
 * The same value is guaranteed to be returned from the memoizer function every
 * time it is invoked within a single example. After each example the state is
 * reset.
 *
 * If the memoizer function is overridden in an example group, the overridden
 * function is seen by all sub-contexts. It is then reset to the previous
 * state before further example groups are executed.
 *
 * @example
 *
 *   var memo = require('memo-is');
 *
 *   describe('Memoizer', function(){
 *     var example = memo().is(function() { return []; });
 *
 *     it('returns the same value every time', function(){
 *       assert(example() === example());
 *     });
 *
 *     describe('when overridden', function(){
 *       example.is(function() { return ['bob']; });
 *
 *       it('returns the overridden value', function(){
 *         assert.equal(example()[0], 'bob');
 *       });
 *
 *       describe('and used in a sub context', function(){
 *         it('returns the overridden value', function(){
 *           assert.equal(example()[0], 'bob');
 *         });
 *       });
 *     });
 *
 *     describe('state between tests', function(){
 *       it('is reset to the value for the current context', function(){
 *         assert.equal(example().length, 0);
 *       });
 *
 *       describe('when the value is modified', function(){
 *         it('is changed in the example that modifies it', function(){
 *           example().push(42);
 *           assert.equal(example()[0], 42);
 *         });
 *
 *         it('is reset between examples', function(){
 *           assert.equal(example().length, 0);
 *         });
 *       });
 *     });
 *   });
 */
var Memoizer = function() {
  var value
    , stack = []
    , invoked = false
    ;

  var memoizer = function() {
    if (stack.length == 0) {
      throw new Error('Memoizer function called outside of test example context');
    }

    if (!invoked) {
      value   = stack[stack.length - 1]();
      invoked = true;
    }
    return value;
  };

  var reset = function() {
    invoked = false;
    value   = undefined;
  };

  var push = function(callback) {
    return function() { stack.push(callback); };
  };

  var pop = function() {
    stack.pop();
  };

  /** Push a new function to the memoizer stack for the current example group */
  this.is = function(callback) {
    before(push(callback));
    afterEach(reset);
    after(pop);
    return memoizer;
  };

  memoizer.is = this.is;
};

if (typeof(module) != 'undefined' && module.exports) { // Node.js
  /**
   * Return a new Memoizer object.
   *
   * @example
   *   var dog = memo().is(function(){ return new Dog(); });
   *
   * @return [Memoizer]
   */
  var memo = module.exports = function() {
    return new Memoizer();
  };
} else { // everything else
  function memo() {
    return new Memoizer();
  }
}
