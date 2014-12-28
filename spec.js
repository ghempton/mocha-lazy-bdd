var expect = require('chai').expect;

describe('mocha-lazy-bdd', function() {
  
  describe('lazy', function() {
    
    var hitCount;
    beforeEach(function() {
      hitCount = 0;
    });
    
    lazy('value', function() {
      hitCount++;
      return 'i am lazy';
    });
    
    lazy('anotherValue', function() {
      return this.value + '(er)';
    });
    
    it('returns the specified value', function() {
      expect(this.value).to.eq('i am lazy');
    });
    
    it('evaluates lazily', function() {
      expect(hitCount).to.eq(0);
      this.value;
      expect(hitCount).to.eq(1);
    });
    
    it('caches the result', function() {
      expect(this.value).to.eq('i am lazy');
      expect(this.value).to.eq('i am lazy');
      expect(hitCount).to.eq(1);
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
      
      it('can access parent value using Object.getPrototypeOf', function() {
        expect(this.value).to.eq('lazier');
        expect(Object.getPrototypeOf(this).value).to.eq('i am lazy');
      });
      
      context('another nested suite', function() {
        lazy('value', function() {
          return this._super.value + '++';
        });
        
        it('can access parent value using _super', function() {
          expect(this.value).to.eq('lazier++');
        });
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
