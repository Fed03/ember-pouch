import DS from 'ember-data';

export default DS.Adapter.extend({

  /*
    @method findRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} id
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  findRecord(store, type, id, snapshot) {

  },

  /*
    @method createRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  createRecord(store, type, snapshot) {

  },

  /*
    @method updateRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  updateRecord(store, type, snapshot) {

  },

  /*
    @method deleteRecord
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the record
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  deleteRecord(store, type, snapshot) {

  },

  /*
    @method findAll
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} sinceToken
    @param {DS.SnapshotRecordArray} snapshotRecordArray
    @return {Promise} promise
  */
  findAll(store, type, sinceToken, snapshotRecordArray) {

  },

  /*
    @method query
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @param {DS.AdapterPopulatedRecordArray} recordArray
    @return {Promise} promise
  */
  query(store, type, query, recordArray) {

  },
  /**
    TODO: Find multiple records at once if coalesceFindRequests is true.
    
    @method findMany
    @param {DS.Store} store
    @param {DS.Model} type   the DS.Model class of the records
    @param {Array}    ids
    @param {Array} snapshots
    @return {Promise} promise
  */
  findMany(store, type, ids, snapshots) {

  },
});
