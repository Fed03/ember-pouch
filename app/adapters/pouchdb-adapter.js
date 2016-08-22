import { Adapter } from 'ember-pouch';
import config from '../config/environment';

export default Adapter.extend({
  options: config.emberPouch || {}
});
