import Ember from 'ember';
import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | relationships', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('it can find hasMany relationships', function(assert) {
  return createRaw([
    { _id: 'taco-soup_2_A', data: { flavor: 'foo', ingredients: ['X', 'Y'] } },
    { _id: 'taco-soup_2_B', data: { flavor: 'bar', ingredients: ['Z'] } },
    { _id: 'ingredient_2_X', data: { name: 'carrot' } },
    { _id: 'ingredient_2_Y', data: { name: 'tomato' } },
    { _id: 'ingredient_2_Z', data: { name: 'pork' } }
  ]).then(() => {
    return this.store.findRecord('taco-soup', 'A');
  }).then(found => {
    assert.equal(found.get('id'), 'A', 'should have found the requested item');
    return found.get('ingredients');
  }).then(ingredients => {
    assert.equal(ingredients.get('length'), 2, 'should have retrieved 2 ingredients');
    assert.deepEqual(ingredients.mapBy('id'), ['X', 'Y'], 'should have found both associated items');
    assert.deepEqual(ingredients.mapBy('name'), ['carrot', 'tomato'], 'should have fully loaded the associated items');
  });
});
