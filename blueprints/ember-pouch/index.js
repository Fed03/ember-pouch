/*jshint node:true*/
module.exports = {
  description: 'Install ember-pouch deps via Bower',

  afterInstall: function(options) {
    return this.addBowerPackagesToProject([
      { name: 'pouchdb', target: '^5.4.5' },
      { name: 'pouchdb-authentication', target: '^0.5.3' },
      { name: 'relational-pouch', target: '^1.4.4' }
    ]);
  }
};
