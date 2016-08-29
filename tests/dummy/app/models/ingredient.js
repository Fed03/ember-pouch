import { Model } from 'ember-pouch';
import DS from 'ember-data';

export default Model.extend({
  name: DS.attr('string')
});
