import { Model } from 'ember-pouch';

export default Model.extend({
  <%= attrs.length ? '  ' + attrs : '' %>
});
