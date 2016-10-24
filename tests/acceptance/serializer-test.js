import Ember from 'ember';
import { test } from 'qunit';
import moduleForPouch from '../../tests/helpers/module-for-pouch-acceptance';

moduleForPouch('Acceptance | serializer', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('puts attachments into the `attachments` property when saving', function (assert) {
  assert.expect(11);

  const id = 'E';
  const coverImage = {
    name: 'cover.jpg',
    content_type: 'image/jpeg',
    data: window.btoa('cover.jpg'),
    length: 9
  };
  const photo1 = {
    name: 'photo-1.jpg',
    content_type: 'image/jpeg',
    data: window.btoa('photo-1.jpg')
  };
  const photo2 = {
    name: 'photo-2.jpg',
    content_type: 'image/jpeg',
    data: window.btoa('photo-2.jpg')
  };

  return Ember.run(() => {
    const newRecipe = this.store.createRecord('taco-recipe', {
      id,
      coverImage: coverImage,
      photos: [photo1, photo2]
    });

    return newRecipe.save().then(() => {
      return findRaw('tacoRecipe_2_E');
    }).then(newDoc => {
      assertAttachments(assert, newDoc._attachments, 'cover.jpg', {
        digest: 'md5-SxxZx3KOKxy2X2yyCq9c+Q==',
        content_type: 'image/jpeg',
        stub: true,
        length: 9
      });
      assert.deepEqual(Object.keys(newDoc._attachments).sort(),
      [coverImage.name, photo1.name, photo2.name].sort(),
      'all attachments are included in the _attachments property of the doc'
    );
    assert.equal('cover_image' in newDoc.data, true,
    'respects the mapping provided by the serializer `attrs`'
  );
  assert.deepEqual(newDoc.data.cover_image, {
    'cover.jpg': {
      length: 9
    }
  }, 'the attribute contains the file name');
  assert.equal(newDoc.data.cover_image['cover.jpg'].length, 9,
  'the attribute contains the length to avoid empty length when File objects are ' +
  'saved and have not been reloaded'
);
assert.deepEqual(newDoc.data.photo_gallery, {
  'photo-1.jpg': {},
  'photo-2.jpg': {}
});

const recordInStore = this.store.peekRecord('tacoRecipe', 'E');
const coverAttr = recordInStore.get('coverImage');
assert.equal(coverAttr.get('name'), coverImage.name);
assert.equal(coverAttr.get('data'), coverImage.data);

const photosAttr = recordInStore.get('photos');
assert.equal(photosAttr.length, 2, '2 photos');
assert.equal(photosAttr[0].get('name'), photo1.name);
assert.equal(photosAttr[0].get('data'), photo1.data);
  });
  });
});
