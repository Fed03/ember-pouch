/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-pouch',
  init() {
    this._super.init && this._super.init.apply(this, arguments);

    this.emberPouchOptions = this.project.config().emberPouch || {};
  },
  included(app) {
    app.import(app.bowerDirectory + '/pouchdb/dist/pouchdb.min.js');
    app.import(app.bowerDirectory + '/relational-pouch/dist/pouchdb.relational-pouch.min.js');

    if (this.emberPouchOptions.enableAuth === true) {
      app.import(app.bowerDirectory + '/pouchdb-authentication/dist/pouchdb.authentication.min.js');
    }

    app.import('vendor/shims/pouchdb.js', {
      exports: { 'pouchdb': ['default'] }
    });
  }
};
