/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-pouch',
  included(app) {
    app.import(app.bowerDirectory + '/pouchdb/dist/pouchdb.min.js');
    app.import('vendor/shims/pouchdb.js', {
      exports: { 'pouchdb': ['default'] }
    });
  }
};
