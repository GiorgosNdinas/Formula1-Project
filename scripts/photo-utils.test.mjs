import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLicense, imageCandidates } from './photo-utils.mjs';

test('CC0 translated deed URLs normalize to the license root', () => {
  assert.equal(
    normalizeLicense(
      'http://creativecommons.org/publicdomain/zero/1.0/deed.en'
    ),
    'https://creativecommons.org/publicdomain/zero/1.0/'
  );
});
test('BY and BY-SA deed/legalcode URLs are accepted', () => {
  for (const tail of ['', '/', '/deed.en', '/legalcode', '/legalcode.en'])
    assert.equal(
      normalizeLicense(`https://creativecommons.org/licenses/by-sa/4.0${tail}`),
      'https://creativecommons.org/licenses/by-sa/4.0/'
    );
});
test('restricted or unrelated licenses and lookalike domains remain rejected', () => {
  for (const url of [
    'https://creativecommons.org/licenses/by-nc/4.0/',
    'https://creativecommons.org/licenses/by-nd/4.0/',
    'https://creativecommons.org.evil.example/licenses/by/4.0/',
    'https://evil.example/licenses/by/4.0/',
    'javascript:alert(1)',
    'https://creativecommons.org/licenses/by/4.0/unrecognized'
  ])
    assert.equal(normalizeLicense(url), undefined);
});
test('all non-deprecated candidates are tried, preferred first, duplicates removed', () => {
  const claim = (name, rank) => ({
    rank,
    mainsnak: { datavalue: { value: name } }
  });
  assert.deepEqual(
    imageCandidates(
      [
        claim('alternative.jpg', 'normal'),
        claim('preferred.jpg', 'preferred'),
        claim('unsafe.jpg', 'deprecated')
      ],
      'alternative.jpg'
    ),
    ['preferred.jpg', 'alternative.jpg']
  );
});
