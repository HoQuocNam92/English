const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildAnnotations } = require('./reading-glossary.cjs');
test('does not mark fixed technical terms merely because they are in the dictionary', () => {
  const text = 'A query parameter filters the list. JSON stores the data and the server sends a unique identifier.';
  assert.deepEqual(buildAnnotations(text, [{ term: 'query parameter', status: 'published', tags: ['reviewed-meaning'] }]), []);
});
test('same word image is marked for deployment but not photographs', () => {
  const photo = 'Course images are stored in object storage. Learners view the photos.';
  assert.deepEqual(buildAnnotations(photo), []);
  const text = 'The team releases a new image with a rolling update.';
  const a = buildAnnotations(text);
  assert.equal(a.length, 1); assert.equal(a[0].term, 'image');
  assert.match(a[0].definitionVi, /đóng gói/); assert.match(a[0].standaloneMeaning, /hình ảnh/);
  assert.equal(a[0].sourceSentence, text); assert.equal(a[0].contextDependent, true);
});
test('the same sentence distinguishes physical switch ports from TCP/UDP port numbers', () => {
  const text = 'A port on a switch is not the same concept as a TCP or UDP port number.';
  const a = buildAnnotations(text);
  assert.deepEqual(a.map(x => x.senseId), ['switch-port', 'transport-port']);
  assert.notEqual(a[0].definitionVi, a[1].definitionVi);
  for (const span of a) assert.equal(text.slice(span.start, span.end), span.term);
});
test('fit means learning parameters only with machine-learning evidence', () => {
  assert.deepEqual(buildAnnotations('ELT can fit a warehouse with scalable compute.'), []);
  const a = buildAnnotations('The training set is used to fit the model.');
  assert.equal(a[0].senseId, 'ml-fit'); assert.match(a[0].definitionVi, /học/);
});
test('HTTP return cannot be mislabeled as a function return due to neighboring text', () => {
  const a = buildAnnotations('A function handles the request. The endpoint returns 201 Created.');
  assert.equal(a[0].senseId, 'response-return');
});
test('ordinary business labels and features are not mislabeled as machine-learning values', () => {
  assert.deepEqual(buildAnnotations('The team labels the hypothesis and releases a new feature.'), []);
});
