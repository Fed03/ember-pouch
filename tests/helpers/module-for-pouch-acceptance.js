import { Promise as EmberPromise } from "rsvp";
import { module } from "qunit";
import startApp from "../helpers/start-app";
import destroyApp from "../helpers/destroy-app";

import config from "dummy/config/environment";
import PouchDB from "pouchdb";

export default function(name, options = {}, nested = undefined) {
  module(
    name,
    {
      beforeEach(assert) {
        var done = assert.async();

        EmberPromise.resolve()
          .then(() => {
            let db = new PouchDB(config.emberpouch.localDb);

            return db.destroy();
          })
          .then(() => {
            this.application = startApp();

            this.lookup = function(item) {
              return this.application.__container__.lookup(item);
            };

            this.store = function store() {
              return this.lookup("service:store");
            };

            // At the container level, adapters are not singletons (ember-data
            // manages them). To get the instance that the app is using, we have to
            // go through the store.
            this.adapter = function adapter() {
              return this.store().adapterFor("taco-soup");
            };

            this.db = function db() {
              return this.adapter().get("db");
            };

            if (options.beforeEach) {
              options.beforeEach.apply(this, arguments);
            }
            done();
          });
      },

      afterEach() {
        if (this.application) {
          destroyApp(this.application);
        }

        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }
      }
    },
    nested
  );
}
