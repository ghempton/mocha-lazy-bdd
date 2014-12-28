var Mocha = require('mocha');
require('./index.js');

var mocha = new Mocha({
  reporter: 'spec',
  ui: 'lazy-bdd'
});

mocha.addFile('./spec.js');

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
