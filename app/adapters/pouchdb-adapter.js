import { Adapter } from 'ember-pouch';
import { emberPouch } from '../config/environment';

export default Adapter.extend({
  options: emberPouch || {}
});
