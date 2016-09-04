import Ember from 'ember';
import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

const promiseToRunLater = function(callback, wait = 40) {
  return new Ember.RSVP.Promise((resolve) => {
    Ember.run.later(() => {
      callback();
      resolve();
    }, wait);
  });
};

moduleForPouch('Acceptance | change-watcher', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
    this.db = this.application.__container__.lookup('adapter:application').get('db');
  }
});

test('a loaded instance automatically reflects directly-made database changes', function (assert) {
  assert.expect(2);
  return Ember.run(() => {
    return putRaw({
      _id: 'taco-soup_2_A',
      data: { flavor: 'foo' }
    }).then(() => {
      return this.store.find('taco-soup', 'A');
    }).then(soupB => {
      assert.equal('foo', soupB.get('flavor'), 'the loaded instance should reflect the initial test data');

      return findRaw('taco-soup_2_A');
    }).then(soupBRecord => {
      soupBRecord.data.flavor = 'bar';
      return putRaw(soupBRecord);
    }).then(() => {
      return promiseToRunLater(() => {
        const alreadyLoadedSoupB = this.store.peekRecord('taco-soup', 'A');
        assert.equal(alreadyLoadedSoupB.get('flavor'), 'bar', 'the loaded instance should automatically reflect the change in the database');
      });
    });
  });
});

test('a record that is not loaded stays not loaded when it is changed', function (assert) {
  assert.expect(2);
  return Ember.run(() => {
    return putRaw([
      {_id: 'taco-soup_2_A', data: { flavor: 'foo' } },
      {_id: 'taco-soup_2_B', data: { flavor: 'foo' } },
    ]).then(() => {
      // we need to provide the rel object to Pouchdb via `setSchema`
      // it's the only purpose of this line
      return this.store.findRecord('taco-soup', 'B');
    }).then(() => {
      assert.equal(null, this.store.peekRecord('taco-soup', 'A'), 'test setup: record should not be loaded already');
      return findRaw('taco-soup_2_A');
    }).then(soupARecord => {
      soupARecord.data.flavor = 'barbacoa';
      return putRaw(soupARecord);
    }).then(() => {
      return promiseToRunLater(() => {
        assert.equal(null, this.store.peekRecord('taco-soup', 'A'), 'the corresponding instance should still not be loaded');
      });
    });
  });
});

test('a new record is not automatically loaded', function (assert) {
  assert.expect(2);
  return Ember.run(() => {
    return putRaw([
      {_id: 'taco-soup_2_A', data: { flavor: 'foo' } },
      {_id: 'taco-soup_2_B', data: { flavor: 'foo' } },
    ]).then(() => {
      // we need to provide the rel object to Pouchdb via `setSchema`
      // it's the only purpose of this line
      return this.store.findRecord('taco-soup', 'B');
    }).then(() => {
      assert.equal(null, this.store.peekRecord('taco-soup', 'C'), 'test setup: record should not be loaded already');

    return putRaw({ _id: 'taco-soup_2_C', data: { flavor: 'sofritas' } });
    }).then(() => {
      return promiseToRunLater(() => {
        assert.equal(null, this.store.peekRecord('taco-soup', 'C'), 'the corresponding instance should still not be loaded');
      });
    });
  });
});

test('a deleted record is automatically unloaded', function (assert) {
  assert.expect(2);
  return Ember.run(() => {
    return putRaw({
      _id: 'taco-soup_2_A',
      data: { flavor: 'foo' }
    }).then(() => {
      return this.store.find('taco-soup', 'A');
    }).then(soupA => {
      assert.equal('foo', soupA.get('flavor'), 'the loaded instance should reflect the initial test data');

      return findRaw('taco-soup_2_A');
    }).then((soupBRecord) => {
      return this.db.remove(soupBRecord);
    }).then(() => {
      return promiseToRunLater(() => {
        assert.equal(null, this.store.peekRecord('taco-soup', 'A'), 'the corresponding instance should no longer be loaded');
      });
    });
  });
});

test('a change to a record with a non-relational-pouch ID does not cause an error', function (assert) {
  assert.expect(0);
  return Ember.run(() => {
    return putRaw({
      _id: 'taco-soup_2_A',
      data: { flavor: 'foo' }
    }).then(() => {
      // do some op to cause relational-pouch to be initialized
      return this.store.find('taco-soup', 'A');
    }).then(() => {
      return putRaw({
        _id: '_design/ingredient-use'
      });
    });
  });
});
