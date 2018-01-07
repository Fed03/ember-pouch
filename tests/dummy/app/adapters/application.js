import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import Adapter from 'dummy/adapter';
import PouchDB from 'pouchdb';
import config from 'dummy/config/environment';

function createDb() {
  let localDb = config.emberpouch.localDb;

  assert('emberpouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberpouch.remote) {
      let remoteDb = new PouchDB(config.emberpouch.remoteDb);

      db.sync(remoteDb, {
        live: true,
        retry: true
      });
  }

  return db;
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
