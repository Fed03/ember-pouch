import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | query-method', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('can query with sort', function (assert) {
  return createQueryIndex({
    fields: ['data.name']
  }).then(() => {
    return putRaw([
      { _id: 'smasher_2_mario', data: { name: 'Mario', series: 'Mario', debut: 1981 }},
      { _id: 'smasher_2_puff', data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 }},
      { _id: 'smasher_2_link', data: { name: 'Link', series: 'Zelda', debut: 1986 }},
      { _id: 'smasher_2_dk', data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 }},
      { _id: 'smasher_2_pika', data: { name: 'Pikachu', series: 'Pokemon', _id: 'pikachu', debut: 1996 }}
    ]);
  }).then(() => {
    return this.store.query('smasher', {
      filter: { name: {$gt: '' } },
      sort: ['name']
    });
  }).then(found => {
    assert.equal(found.get('length'), 5, 'should returns all the smashers');
    assert.deepEqual(found.mapBy('id'), ['dk','puff','link','mario','pika'], 'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('name'), ['Donkey Kong', 'Jigglypuff', 'Link', 'Mario','Pikachu'], 'should have extracted the attributes also');
  });
});

test('can query multi-field queries', function (assert) {
  return createQueryIndex({
    fields: ['data.series', 'data.debut']
  }).then(() => {
    return putRaw([
      { _id: 'smasher_2_mario', data: { name: 'Mario', series: 'Mario', debut: 1981 }},
      { _id: 'smasher_2_puff', data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 }},
      { _id: 'smasher_2_link', data: { name: 'Link', series: 'Zelda', debut: 1986 }},
      { _id: 'smasher_2_dk', data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 }},
      { _id: 'smasher_2_pika', data: { name: 'Pikachu', series: 'Pokemon', _id: 'pikachu', debut: 1996 }}
    ]);
  }).then(() => {
    return this.store.query('smasher', {
      filter: {series: 'Mario' },
      sort: [
        {series: 'desc'},
        {debut: 'desc'}]
    });
  }).then(found => {
    assert.equal(found.get('length'), 2, 'should have found the two smashers');
    assert.deepEqual(found.mapBy('id'), ['mario', 'dk'], 'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('name'), ['Mario', 'Donkey Kong'], 'should have extracted the attributes also');
  });
});

test('can query one record', function (assert) {
  return createQueryIndex({
    fields: ['data.flavor']
  }).then(() => {
    return putRaw([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
      { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
      { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
      { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
    ]);
  }).then(() => {
    return this.store.queryRecord('taco-soup', {
      filter: {flavor: 'al pastor' }
    });
  }).then(found => {
    assert.equal(found.get('flavor'), 'al pastor', 'should have found the requested item');
  });
});

test('can query one associated records', function (assert) {
  return createQueryIndex({
    fields: ['data.flavor']
  }).then(() => {
    return putRaw([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
      { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
      { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
      { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
    ]);
  }).then(() => {
    return this.store.queryRecord('taco-soup', {
      filter: {flavor: 'al pastor' }
    });
  }).then(found => {
    assert.equal(found.get('flavor'), 'al pastor', 'should have found the requested item');
    return found.get('ingredients');
  }).then(foundIngredients => {
    assert.deepEqual(foundIngredients.mapBy('id'), ['X', 'Y'], 'should have found both associated items');
    assert.deepEqual(foundIngredients.mapBy('name'), ['pineapple', 'pork loin'], 'should have fully loaded the associated items');
  });
});
