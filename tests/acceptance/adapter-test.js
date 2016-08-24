import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | pouchdb-adapter', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('it can find one doc', function(assert) {
  return createRaw([
    { _id: 'taco-soup_2_A', data: { flavor: 'al pastor' } },
    { _id: 'burrito-shake_2_X', data: { consistency: 'smooth' } }
  ]).then(() => {
    return this.store.findRecord('taco-soup', 'A');
  }).then(found => {
    assert.equal(found.get('id'), 'A', 'should have found the requested item');
    assert.deepEqual(found.get('flavor'), 'al pastor', 'should have extracted the attributes also');
  });
});

test('it can find all docs of one type', function(assert) {
  return createRaw([
    { _id: 'taco-soup_2_A', data: { flavor: 'al pastor' } },
    { _id: 'taco-soup_2_B', data: { flavor: 'black bean' } },
    { _id: 'burrito-shake_2_X', data: { consistency: 'smooth' } }
  ]).then(() => {
    return this.store.findAll('taco-soup');
  }).then(found => {
    assert.equal(found.get('length'), 2, 'should have found the two taco soup items only');
    assert.deepEqual(found.mapBy('id'), ['A', 'B'], 'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['al pastor', 'black bean'], 'should have extracted the attributes also');
  });
});
