import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('createQueryIndex', function(app, index) {
  const db = app.__container__.lookup('adapter:application').get('db');

  return db.createIndex({ index });
});
