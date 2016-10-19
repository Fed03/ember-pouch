import Ember from 'ember';
import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | basic-crud-operations', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('it can find one doc', function(assert) {
  return putRaw([
    { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
    { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
  ]).then(() => {
    return this.store.findRecord('taco-soup', 'A');
  }).then(found => {
    assert.equal(found.get('id'), 'A', 'should have found the requested item');
    assert.deepEqual(found.get('flavor'), 'al pastor', 'should have extracted the attributes also');
  });
});

test('it can find all docs of one type', function(assert) {
  return putRaw([
    { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
    { _id: 'tacoSoup_2_B', data: { flavor: 'black bean' } },
    { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
  ]).then(() => {
    return this.store.findAll('taco-soup');
  }).then(found => {
    assert.equal(found.get('length'), 2, 'should have found the two taco soup items only');
    assert.deepEqual(found.mapBy('id'), ['A', 'B'], 'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['al pastor', 'black bean'], 'should have extracted the attributes also');
  });
});

test('it can create a new record', function(assert) {
  return Ember.run(() => {

    const doc = this.store.createRecord('taco-soup', {
      id: 'A',
      flavor: 'foo'
    });

    return doc.save().then(() => {
      return findRaw('tacoSoup_2_A');
    }).then(found => {
      assert.equal(found.data.flavor, 'foo', 'should have saved the attribute');

      var recordInStore = this.store.peekRecord('taco-soup', 'A');
      assert.equal(found._rev, recordInStore.get('rev'),
        'should have associated the ember-data record with the rev for the new record');
    });
  });
});

test('it deletes an existing record', function(assert) {
  assert.expect(1);
  return Ember.run(() => {
    const doc = this.store.createRecord('taco-soup', {
      id: 'A',
      flavor: 'foo'
    });

    return doc.save().then(newDoc => {
      return newDoc.destroyRecord();
    }).then(() => {
      return findRaw('tacoSoup_2_A');
    }).then(null, notFoundError => {
      assert.equal(notFoundError.status, 404, 'document should no longer exist');
    });
  });
});

test('it updates an existing record', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    const doc = this.store.createRecord('taco-soup', {
      id: 'A',
      flavor: 'foo'
    });

    return doc.save().then(newDoc => {
      newDoc.set('flavor', 'bar');
      return newDoc.save();
    }).then(() => {
      return findRaw('tacoSoup_2_A');
    }).then(updatedRecord => {
      assert.equal(updatedRecord.data.flavor, 'bar', 'should have updated the attribute');

      var recordInStore = this.store.peekRecord('taco-soup', 'A');
      assert.equal(updatedRecord._rev, recordInStore.get('rev'),
        'should have associated the ember-data record with the updated rev');
    });
  });
});
