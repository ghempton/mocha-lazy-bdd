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
    
    context('inside a nested context', function() {
      
      it('evaluates lazily', function() {
        expect(hitCount).to.eq(0);
        this.value;
        expect(hitCount).to.eq(1);
      });
      
    });
    
    context('inside a nested context with an overridden value', function() {
      
      lazy('value', function() {
        return 'lazier';
      });
      
      it('can be overridden', function() {
        expect(this.value).to.eq('lazier');
      });
      
      it('can depend on other overridden lazy values', function() {
        expect(this.anotherValue).to.eq('lazier(er)');
      });
      
      context('another nested context', function() {
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
  
  describe('beforeEach', function() {
    
    lazy('value', function() {
      return 'override me';
    });
    
    beforeEach(function() {
      this.eagerValue = this.value;
    });
    
    it('has access to lazy values', function() {
      expect(this.eagerValue).to.eq('override me');
    });
    
    context('inside a nested context', function() {
      
      it('has access to lazy values', function() {
        expect(this.eagerValue).to.eq('override me');
      });
      
    });
    
    context('inside a nested context with an overridden value', function() {
      
      lazy('value', function() {
        return 'couch potato';
      });
      
      it('has access to the overriden value', function() {
        expect(this.eagerValue).to.eq('couch potato');
      });
      
    });
    
    context('inside a nested context with an overridden value accessing _super', function() {
      
      lazy('value', function() {
        return this._super.value + ' couch potato';
      });
      
      it('has access to the override value', function() {
        expect(this.eagerValue).to.eq('override me couch potato');
      });
      
      context('another level deep', function() {
        
        lazy('value', function() {
          return 'deeply lazy';
        });
        
        it('has access to the override value', function() {
          expect(this.eagerValue).to.eq('deeply lazy');
        });
        
      });
      
    });
    
  });
  
});
