/**
 * Module dependencies.
 */

var Mocha = require('mocha'),
    Suite = Mocha.Suite,
    Test = Mocha.Test,
    utils = Mocha.utils,
    escapeRe = require('escape-string-regexp');

/**
 * Lazy BDD-style interface:
 *
 *      describe('Array', function(){
 *        lazy('lazyValue', function() {
 *          return 'i am lazy';
 *        });
 *        describe('#indexOf()', function(){
 *          it('should return -1 when not present', function(){
 *            this.lazyValue // evaluatesand caches the 'lazy block'
 *          });
 *
 *        });
 *      });
 *
 */ 

module.exports = Mocha.interfaces['lazy-bdd'] = function(suite){
  var suites = [suite];
  var cache = {};
  var insideTest;

  suite.on('pre-require', function(context, file, mocha){

    // clear lazy cache
    suite.beforeEach(function() {
      cache = {};
      insideTest = false;
    });
    
    /**
     * Define a lazy property.
     */
    
    context.lazy = function(name, fn) {
      suites[0].beforeAll(function() {
        var key = name;
        Object.defineProperty(this, name, {
          configurable: true,
          enumerable: false,
          get: function() {
            // need to access the property in the context of the current test
            // inside of hooks in case the value was overridden
            if(!insideTest && this.currentTest && this.currentTest.ctx) {
              insideTest = true;
              return this.currentTest.ctx[name];
            }
            if(key in cache) {
              return cache[key];
            }
            this._super = Object.getPrototypeOf(this);
            var res = fn.apply(this);
            delete this._super;
            insideTest = false;
            return cache[key] = res;
          }
        });
      });
    };
    
    /**
     * Alias for `lazy` and provides 'subject' name as default.
     */
    
    context.subject = function(name, fn) {
      if(arguments.length === 1) {
        fn = name;
        name = 'subject';
      }
      context.lazy.call(this, name, fn);
    };

    /**
     * Execute before running tests.
     */

    context.before = function(name, fn){
      suites[0].beforeAll(name, fn);
    };

    /**
     * Execute after running tests.
     */

    context.after = function(name, fn){
      suites[0].afterAll(name, fn);
    };

    /**
     * Execute before each test case.
     */

    context.beforeEach = function(name, fn){
      suites[0].beforeEach(name, fn);
    };

    /**
     * Execute after each test case.
     */

    context.afterEach = function(name, fn){
      suites[0].afterEach(name, fn);
    };

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe =
    context.xcontext =
    context.describe.skip = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn){
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function(title, fn){
      var suite = suites[0];
      if (suite.pending) fn = null;
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn){
      var test = context.it(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit =
    context.xspecify =
    context.it.skip = function(title){
      context.it(title);
    };
  });
};
