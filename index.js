/**
 * Module dependencies.
 */

var Mocha = require('mocha'),
    Suite = Mocha.Suite,
    Test = Mocha.Test,
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
    var common = require('mocha/lib/interfaces/common')(suites, context);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    // clear lazy cache
    suite.beforeEach(function() {
      cache = {};
      insideTest = false;
    });

    /**
     * Define a lazy property.
     */

    context.lazy = function(name, fn, { useCache = true } = {}) {
      var key = name,
          prototype = suites[0].ctx;
      Object.defineProperty(prototype, name, {
        configurable: true,
        enumerable: false,
        get: function() {
          // need to access the property in the context of the current test
          // inside of hooks in case the value was overridden
          if(!insideTest && this.currentTest && this.currentTest.ctx) {
            insideTest = true;
            return this.currentTest.ctx[name];
          }
          if(useCache && key in cache) {
            insideTest = false;
            return cache[key];
          }
          this._super = Object.getPrototypeOf(prototype);
          var res = fn.apply(this);
          delete this._super;
          insideTest = false;
          return cache[key] = res;
        },
        set: function(value) {
          throw new Error(
            "Do not directly set lazy variables `this.someVar = 1;`, but use the lazy method " +
            "to override the variable `lazy('someVar', function() { return 1; });`"
          );
        }
      });
    };

    /**
     * Alias for `lazy` and provides 'subject' name as default.
     */

    context.subject = function(name, fn, opts) {
      if(typeof name === 'function') {
        opts = fn;
        fn = name;
        name = 'subject';
      }
      context.lazy.call(this, name, fn, opts);
    };


    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn) {
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

    context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn) {
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    var it = context.it = context.specify = function(title, fn) {
      var suite = suites[0];
      if (suite.pending) {
        fn = null;
      }
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn) {
      var test = it(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function(n) {
      context.retries(n);
    };
  });
};
