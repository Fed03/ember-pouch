/* eslint-env node */
"use strict";

var path = require("path");
var stew = require("broccoli-stew");
const Funnel = require("broccoli-funnel");
const Rollup = require("broccoli-rollup");

module.exports = {
  name: "ember-pouch",

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);

    var bowerDeps = this.project.bowerDependencies();

    if (bowerDeps["pouchdb"]) {
      this.ui.writeWarnLine("Please remove `pouchdb` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.");
    }
    if (bowerDeps["relational-pouch"]) {
      this.ui.writeWarnLine("Please remove `relational-pouch` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.");
    }
    if (bowerDeps["pouchdb-find"]) {
      this.ui.writeWarnLine("Please remove `pouchdb-find` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.");
    }
  },

  // treeForVendor: function() {
  //   var pouchdb = stew.find(path.join(path.dirname(require.resolve('pouchdb')), '..', 'dist'), {
  //     destDir: 'pouchdb',
  //     files: ['pouchdb.js']
  //   });
  //
  //   var relationalPouch = stew.find(path.join(path.dirname(require.resolve('relational-pouch')), '..', 'dist'), {
  //     destDir: 'pouchdb',
  //     files: ['pouchdb.relational-pouch.js']
  //   });
  //
  //   var shims = stew.find(__dirname + '/vendor/pouchdb', {
  //     destDir: 'pouchdb',
  //     files: ['shims.js']
  //   });
  //
  //   return stew.find([
  //     pouchdb,
  //     relationalPouch,
  //     shims
  //   ]);
  // },

  treeForVendor() {
    var pouchdb = new Funnel(path.dirname(require.resolve("pouchdb-browser")));
    return new Rollup(pouchdb, {
      rollup: {
        input: "./index.js",
        output: {
          file: "pouchdb.js",
          format: "iife"
        }
      }
    });
  },

  included(app) {
    app.import("vendor/pouchdb.js");
    app.import("node_modules/relational-pouch/dist/pouchdb.relational-pouch.js");
    // app.import('vendor/pouchdb/pouchdb.js');
    // app.import('vendor/pouchdb/pouchdb.relational-pouch.js');
    // app.import('vendor/pouchdb/shims.js', {
    //   exports: { 'pouchdb': [ 'default' ]}
    // });
  }
};
