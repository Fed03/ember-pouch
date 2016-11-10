import Ember from 'ember';
import DS from 'ember-data';

const {
  get,
  isNone,
  isArray
} = Ember;
const keys = Object.keys || Ember.keys;

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (isNone(serialized)) { return []; }

    return keys(serialized).map(attachmentName => {
      const attachment = serialized[attachmentName];
      return Ember.Object.create({
        name: attachmentName,
        content_type: attachment.content_type,
        data: attachment.data,
        stub: attachment.stub,
        length: attachment.length,
        digest: attachment.digest,
      });
    });
  },

  serialize: function(deserialized) {
    if (!isArray(deserialized)) { return null; }

    return deserialized.reduce((acc, attachment) => {
      const serialized = {
        content_type: get(attachment, 'content_type'),
      };
      if (get(attachment, 'stub')) {
        serialized.stub = true;
        serialized.length = get(attachment, 'length');
        serialized.digest = get(attachment, 'digest');
      } else {
        serialized.data = get(attachment, 'data');
        serialized.length = get(attachment, 'length');
      }
      acc[get(attachment, 'name')] = serialized;
      return acc;
    }, {});
  }
});
