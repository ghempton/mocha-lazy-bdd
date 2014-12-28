# Mocha Lazy BDD

This module provides a Lazy BDD interface to mocha. The interfaces is identical to the standard `bdd` interface, but also provides additional RSpec-style `lazy`/`subject` macros.

## Example Spec

```javascript
var expect = require('chai').expect;

describe('mocha-lazy-bdd', function() {
  
  describe('lazy', function() {
    
    lazy('value', function() {
      return 'i am lazy';
    });
    
    it('returns the specified value', function() {
      expect(this.value).to.eq('i am lazy');
    });
    
  });
  
});
```

See [this project's specs](https://github.com/ghempton/mocha-lazy-bdd/blob/master/spec.js) for more examples.

## Installation and Usage

```
npm install --save-dev mocha-lazy-bdd
mocha -u lazy-bdd
```

Or in a browser environment: install `mocha-lazy` via bower and then include the distribution before mocha has been setup.
