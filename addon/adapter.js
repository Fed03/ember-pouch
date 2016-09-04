import DS from 'ember-data';
import PouchDB from 'pouchdb';
import Ember from 'ember';
import DbError from './db-error';

const {
  run,
  String: { pluralize, camelize },
  RSVP: { Promise }
} = Ember;

export default DS.Adapter.extend({

  coalesceFindRequests: true,
  autoLoadNewDoc: false,
  defaultSerializer: '-rest',

  init() {
    this.db = new PouchDB(this.options.localDb);
    this._setupChangesListener();
  },

  /**
    @method findRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} id
    @return {Promise} promise
  */
  findRecord(store, type, id) {
    this._setSchema(type);
    return this.get('db').rel.find(type.modelName, id);
  },

  /**
    @method createRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  createRecord(store, type, snapshot) {
    this._setSchema(type);

    const data = this._serializeToData(store, type, snapshot);
    return this.get('db').rel.save(type.modelName, data);
  },

  /**
    @method updateRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  updateRecord(store, type, snapshot) {
    this._setSchema(type);

    const data = this._serializeToData(store, type, snapshot);
    return this.get('db').rel.save(type.modelName, data);
  },

  /**
    @method deleteRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  deleteRecord(store, type, snapshot) {
    this._setSchema(type);

    return this.get('db').rel.del(type.modelName, {
      id: snapshot.id,
      rev: snapshot.attributes().rev
    }).then(() => null);
  },

  /**
    @method findAll
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} sinceToken
    @return {Promise} promise
  */
  // TODO: sinceToken
  findAll(store, type/*, sinceToken*/) {
    this._setSchema(type);
    return this.get('db').rel.find(type.modelName);
  },

  /**
    @method query
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @param {DS.AdapterPopulatedRecordArray} recordArray
    @return {Promise} promise
  */
  // query(store, type, query, recordArray) {
  //
  // },
  /**
    TODO: Find multiple records at once if coalesceFindRequests is true.

    @method findMany
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the records
    @param {Array}    ids
    @return {Promise} promise
  */
  findMany(store, type, ids) {
    this._setSchema(type);

    return this.get('db').rel.find(type.modelName, ids);
  },


  /**
    @method unloadedDocumentChanged
    @param {String} type
    @param {Integer} id
    @return {Promise}
  */
  unloadedDocumentChanged(type, id) {
    return this.get('db').rel.find(type, id).then(doc => {
      run(() => {
        this.store.pushPayload(type, doc);
      });
    });
  },

  /**
    @method _setSchema
    @private
    @param {DS.Model} type   the DS.Model class of the records
  */
  _setSchema(type) {
    const schema = {
      singular: type.modelName,
      plural: pluralize(type.modelName)
    };

    this.get('db').setSchema([schema]);
  },

  /**
    @method _serializeToData
    @private
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Object}
  */
  _serializeToData(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

    return data[camelize(type.modelName)];
  },

  /**
    @method _setupChangesListener
    @private
  */
  _setupChangesListener() {
    this.get('db').changes({
      live: true,
      since: 'now',
      return_docs: false
    }).on('change', (...args) => {
      run(() => {
        return this._updateDB(...args);
      });
    });
  },

  /**
    @method _updateDB
    @private
    @param {Object} changedDoc
    @return {Promise}
  */
  _updateDB(changedDoc) {
    try {
      const relationalInfo = this._getRelationalInfo(changedDoc);
      const loadedDoc = this._getLoadedDoc(relationalInfo.type, relationalInfo.id);

      if (!loadedDoc) {
        if (this.get('autoLoadNewDoc')) {
          return this.unloadedDocumentChanged(relationalInfo.type, relationalInfo.id);
        }
        return Promise.resolve();
      }

      if (changedDoc.deleted) {
        loadedDoc.unloadRecord();
        return Promise.resolve();
      }

      return loadedDoc.reload();
    } catch (e) {
      if (e instanceof DbError) {
        return Promise.resolve();
      }
      return Promise.reject(e);
    }
  },

  /**
    @method _getRelationalInfo
    @private
    @param {Object} doc The doc object coming from Pouchdb
    @return {Object}
  */
  _getRelationalInfo(doc) {
    const db = this.get('db').rel;
    // If relational_pouch isn't initialized yet,
    // there can't be any records in the store to update.
    if (!db) {
      throw new DbError('relational-pouch isn\'t initialized yet.');
    }

    const relationalInfo = db.parseDocID(doc.id);
    if (!relationalInfo.type) {
      throw new DbError('The doc has no relational identifier.');
    }

    try {
      this.store.modelFor(relationalInfo.type);
    } catch (e) {
      throw new DbError(e);
    }

    return relationalInfo;
  },

  /**
    @method _getLoadedDoc
    @private
    @param {String} type
    @param {Integer} id
    @return {DS.Model}
  */
  _getLoadedDoc(type, id) {
    const loadedDoc = this.store.peekRecord(type, id);

    if (!loadedDoc) {
      // The record hasn't been loaded into the store; no need to reload its data.
      return;
    }

    if (!loadedDoc.get('isLoaded') || loadedDoc.get('hasDirtyAttributes')) {
      // The record either hasn't loaded yet or has unpersisted local changes.
      // In either case, we don't want to refresh it in the store
      // (and for some substates, attempting to do so will result in an error).
      throw new DbError('The doc isn\'t loaded into the store yet.');
    }

    return loadedDoc;
  }
});
