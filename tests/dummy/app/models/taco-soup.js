import { Model } from 'ember-pouch';
import DS from 'ember-data';

export default Model.extend({
  flavor: DS.attr('string'),
  ingredients: DS.hasMany('ingredient')
});
