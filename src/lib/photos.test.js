import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePhoto, ALLOWED_LICENSE } from './photos.js';

const photos = JSON.parse(fs.readFileSync(new URL('../data/photos.json', import.meta.url), 'utf8'));

test('licenses: free ones allowed, NC/ND and unknown rejected', () => {
  for (const ok of ['CC BY-SA 4.0', 'CC BY 2.0', 'CC0', 'Public domain', 'CC BY-SA 3.0 de', 'CC BY 2.5']) assert.ok(ALLOWED_LICENSE.test(ok), ok);
  for (const bad of ['CC BY-NC 4.0', 'CC BY-ND 4.0', 'CC BY-NC-SA 3.0', 'All rights reserved', '']) assert.ok(!ALLOWED_LICENSE.test(bad), bad);
});

test('every photo has credits, an allowed license and its file', () => {
  for (const [slug, photo] of Object.entries(photos)) {
    assert.deepEqual(validatePhoto(slug, photo), []);
    assert.ok(fs.existsSync(new URL(`../assets/photos/${photo.file}`, import.meta.url)), `${slug}: falta el archivo`);
  }
});

test('a photo without author is rejected', () => {
  assert.ok(validatePhoto('x', { file: 'x.jpg', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:X.jpg', title: 'X' }).length > 0);
});
