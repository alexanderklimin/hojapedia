import test from 'node:test';
import assert from 'node:assert/strict';
import { imageObject, article, absolute, publisher } from './seo.js';

const photo = { alt: 'Flor blanca', author: 'Ana', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:X.jpg' };

test('image object carries credit and licence', () => {
  const o = imageObject(photo, '/_astro/x.jpg', 1200, 900);
  assert.equal(o.contentUrl, 'https://hojapedia.com/_astro/x.jpg');
  assert.equal(o.creator.name, 'Ana');
  assert.equal(o.license, photo.licenseUrl);
  assert.equal(o.acquireLicensePage, photo.source);
  assert.match(o.creditText, /Wikimedia Commons/);
  assert.equal(imageObject(undefined, '/x.jpg'), undefined);
});

test('public domain photo falls back to the source page as licence', () => {
  assert.equal(imageObject({ ...photo, licenseUrl: undefined }, '/x.jpg').license, photo.source);
});

test('article has author, publisher logo and sane dates', () => {
  const a = article({ headline: 'H', description: 'D', url: absolute('/plantas/x/'), reviewed: '2026-12-01' });
  assert.equal(a.datePublished, '2026-11-19');
  assert.equal(a.dateModified, '2026-12-01');
  assert.equal(a.author['@type'], 'Organization');
  assert.equal(a.publisher.logo.url, 'https://hojapedia.com/logo.png');
  assert.equal(article({ headline: 'H', description: 'D', url: 'u', reviewed: '2026-11-01' }).datePublished, '2026-11-01');
  assert.equal(publisher().name, 'Hojapedia');
});
