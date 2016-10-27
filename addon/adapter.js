import DS from 'ember-data';
import PouchDB from 'pouchdb';
import Ember from 'ember';
import DbError from './db-error';
import QueryBuilder from './query-builder';

const {
  run,
  on,
  deprecate,
  String: { pluralize, camelize },
  RSVP: { Promise }
} = Ember;

export default DS.Adapter.extend({

  coalesceFindRequests: true,
  autoLoadNewDoc: false,
  defaultSerializer: '-rest',

  init() {
    if (this.options && this.options.localDb) {
      this.db = new PouchDB(this.options.localDb);
    } else {
      deprecate(
        'Using `createDb()` in custom adapter definition is deprecated in favor of simple option definition.',
        false,
        {
          id: 'ember-pouch.options.localDb',
          until: '5.0.0'
        }
      );
    }
  },

  _onInit: on('init', function() {
    this._setupChangesListener();
  }),

  /**
    @method findRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} id
    @return {Promise} promise
  */
  findRecord(store, type, id) {
    this._setSchema(type);

    const modelName = this.getRecordTypeName(type);
    return this.get('db').rel.find(modelName, id);
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

    const modelName = this.getRecordTypeName(type);
    const data = this._serializeToData(store, type, snapshot);
    return this.get('db').rel.save(modelName, data);
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

    const modelName = this.getRecordTypeName(type);
    const data = this._serializeToData(store, type, snapshot);
    return this.get('db').rel.save(modelName, data);
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

    const modelName = this.getRecordTypeName(type);
    return this.get('db').rel.del(modelName, {
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

    const modelName = this.getRecordTypeName(type);
    return this.get('db').rel.find(modelName);
  },

  /**
    @method query
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @return {Promise} promise
  */
  query(store, type, query) {
    this._setSchema(type);

    const builder = new QueryBuilder(this.get('db'), query);
    return builder.query().then(raw => {
      const modelName = this.getRecordTypeName(type);
      return {
        [pluralize(modelName)]: raw
      };
    });
  },

  /**
    @method queryRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @return {Promise} promise
  */
  queryRecord(store, type, query) {
    return this.query(store, type, query);
  },

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

    const modelName = this.getRecordTypeName(type);
    return this.get('db').rel.find(modelName, ids);
  },

  /**
    Returns the string to use for the model name part of the PouchDB document
    ID for records of the given ember-data type.

    This method uses the camelized version of the model name in order to
    preserve data compatibility with older versions of ember-pouch. See
    nolanlawson/ember-pouch#63 for a discussion.

    You can override this to change the behavior. If you do, be aware that you
    need to execute a data migration to ensure that any existing records are
    moved to the new IDs.

    @method getRecordTypeName
    @param {String} type
    @return {String}
  */
  getRecordTypeName(type) {
    return camelize(type.modelName);
  },

  /**
    @method _loadNewDocument
    @private
    @param {String} type
    @param {Integer} id
    @return {Promise}
  */
  _loadNewDocument(type, id) {
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
    const singular = this.getRecordTypeName(type);
    const schema = {
      singular,
      plural: pluralize(singular)
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
          return this._loadNewDocument(relationalInfo.type, relationalInfo.id);
        } else if (this.unloadedDocumentChanged) {
          deprecate(
            'Support for `unloadedDocumentChanged()` method in your custom adapter will be removed. Instead use the `autoLoadNewDoc` flag.',
            false,
            {
              id: 'ember-pouch.onChange.unloadedDocumentChanged',
              until: '5.0.0'
            }
          );
          return this.unloadedDocumentChanged(relationalInfo);
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
