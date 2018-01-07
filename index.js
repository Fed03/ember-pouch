/* eslint-env node */
"use strict";
const browserifyTree = require("broccoli-cjs-to-es6");

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

  treeForVendor(tree) {
    return browserifyTree(tree, {
      modules: [
        {
          module: "pouchdb-browser",
          resolution: "pouchdb"
        },
        "relational-pouch",
        "pouchdb-find"
      ],
      outputFile: "pouchdb-browserify.js"
    });
  },

  included(app) {
    app.import("vendor/pouchdb-browserify.js");
  }
};
