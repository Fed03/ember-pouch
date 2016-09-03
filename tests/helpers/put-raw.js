import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('putRaw', function(app, docs) {
  const db = app.__container__.lookup('adapter:application').get('db');
  if (!Array.isArray(docs)) {
    docs = [docs];
  }

  return db.bulkDocs(docs);
});
