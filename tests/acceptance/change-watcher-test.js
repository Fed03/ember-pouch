import Ember from 'ember';
import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

const promiseToRunLater = function(callback, wait = 15) {
  return new Ember.RSVP.Promise((resolve) => {
    Ember.run.later(() => {
      callback();
      resolve();
    }, wait);
  });
};

moduleForPouch('Acceptance | relationships', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
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
