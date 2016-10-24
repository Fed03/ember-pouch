import Ember from 'ember';

export default Ember.Test.registerHelper('assertAttachments', 
  function(app, assert, attachments,fileName, value) {
    delete attachments[fileName].revpos;
    assert.deepEqual(attachments[fileName], value, 'attachments are placed into the _attachments property of the doc');
  }
);
