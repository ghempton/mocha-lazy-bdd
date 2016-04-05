var MochaLazyBdd =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Mocha = __webpack_require__(1),
	    Suite = Mocha.Suite,
	    Test = Mocha.Test,
	    escapeRe = __webpack_require__(2);

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
	    var common = __webpack_require__(3)(suites, context);

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

	    context.lazy = function(name, fn) {
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
	          if(key in cache) {
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

	    context.subject = function(name, fn) {
	      if(arguments.length === 1) {
	        fn = name;
	        name = 'subject';
	      }
	      context.lazy.call(this, name, fn);
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Mocha;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

	module.exports = function (str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		}

		return str.replace(matchOperatorsRe,  '\\$&');
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Functions common to more than one interface.
	 *
	 * @param {Suite[]} suites
	 * @param {Context} context
	 * @return {Object} An object containing common functions.
	 */
	module.exports = function(suites, context) {
	  return {
	    /**
	     * This is only present if flag --delay is passed into Mocha. It triggers
	     * root suite execution.
	     *
	     * @param {Suite} suite The root wuite.
	     * @return {Function} A function which runs the root suite
	     */
	    runWithSuite: function runWithSuite(suite) {
	      return function run() {
	        suite.run();
	      };
	    },

	    /**
	     * Execute before running tests.
	     *
	     * @param {string} name
	     * @param {Function} fn
	     */
	    before: function(name, fn) {
	      suites[0].beforeAll(name, fn);
	    },

	    /**
	     * Execute after running tests.
	     *
	     * @param {string} name
	     * @param {Function} fn
	     */
	    after: function(name, fn) {
	      suites[0].afterAll(name, fn);
	    },

	    /**
	     * Execute before each test case.
	     *
	     * @param {string} name
	     * @param {Function} fn
	     */
	    beforeEach: function(name, fn) {
	      suites[0].beforeEach(name, fn);
	    },

	    /**
	     * Execute after each test case.
	     *
	     * @param {string} name
	     * @param {Function} fn
	     */
	    afterEach: function(name, fn) {
	      suites[0].afterEach(name, fn);
	    },

	    test: {
	      /**
	       * Pending test case.
	       *
	       * @param {string} title
	       */
	      skip: function(title) {
	        context.test(title);
	      },

	      /**
	       * Number of retry attempts
	       *
	       * @param {string} n
	       */
	      retries: function(n) {
	        context.retries(n);
	      }
	    }
	  };
	};


/***/ }
/******/ ]);