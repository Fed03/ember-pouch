import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('findRaw', function(app, key) {
  const db = app.__container__.lookup('adapter:application').get('db');
  return db.get(key);
});
