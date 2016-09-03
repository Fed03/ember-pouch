import DS from 'ember-data';
import PouchDB from 'pouchdb';
import Ember from 'ember';

const { String: { pluralize, camelize } } = Ember;

export default DS.Adapter.extend({

  coalesceFindRequests: true,
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
      Ember.run(() => {
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
      const db = this.get('db').rel;
      // If relational_pouch isn't initialized yet,
      // there can't be any records in the store to update.
      if (!db) {
        return;
      }
      const relationalInfo = db.parseDocID(changedDoc.id);
      const loadedDoc = this.store.peekRecord(relationalInfo.type, relationalInfo.id);

      // The record hasn't been loaded into the store; no need to reload its data.
      if (!loadedDoc) {
        return;
      }

      return loadedDoc.reload();
    } catch (e) {
      return Ember.RSVP.reject(e);
    }
  }
});
