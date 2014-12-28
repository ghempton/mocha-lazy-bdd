module.exports = {
  
  output: {
    library: 'MochaLazyBdd',
    libraryTarget: 'var'
  },

  externals: {
    mocha: 'Mocha'
  },

  node: {
    buffer: false
  }
  
};
