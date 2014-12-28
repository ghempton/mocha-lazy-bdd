var expect = require('chai').expect;

describe('mocha-lazy-bdd', function() {
  
  describe('lazy', function() {
    
    lazyHit = false;
    beforeEach(function() {
      lazyHit = false;
    });
    
    lazy('value', function() {
      lazyHit = true;
      return 'i am lazy';
    });
    
    lazy('anotherValue', function() {
      return this.value + '(er)';
    });
    
    it('returns the specified value', function() {
      expect(this.value).to.eq('i am lazy');
    });
    
    it('evaluates lazily', function() {
      expect(lazyHit).to.be.false;
      this.value;
      expect(lazyHit).to.be.true;
    });
    
    it('can depend on other lazy values', function() {
      expect(this.anotherValue).to.eq('i am lazy(er)');
    });
    
    context('inside a nested suite', function() {
      
      lazy('value', function() {
        return 'lazier';
      });
      
      it('can be overridden', function() {
        expect(this.value).to.eq('lazier');
      });
      
      it('can depend on other overridden lazy values', function() {
        expect(this.anotherValue).to.eq('lazier(er)');
      });
      
    });
    
  });
  
  describe('subject', function() {
    
    subject(function() {
      return 'laziness';
    });
    
    subject('namedSubject', function() {
      return 'haz name';
    });
    
    it('can be accessed via this.subject', function() {
      expect(this.subject).to.eq('laziness');
    });
    
    it('can be named', function() {
      expect(this.namedSubject).to.eq('haz name');
    });
    
  });
  
});
