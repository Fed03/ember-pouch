import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | pouchdb-adapter', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('it can find one doc', function(assert) {
  return createRaw([
    { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
    { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
  ]).then(() => {
    return this.store.find('taco-soup', 'A');
  }).then(found => {
    assert.equal(found.get('id'), 'A', 'should have found the requested item');
    assert.deepEqual(found.get('flavor'), 'al pastor', 'should have extracted the attributes also');
  });
});
