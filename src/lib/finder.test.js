import test from 'node:test';
import assert from 'node:assert/strict';
import { matches, isPetSafe, listsToPublish, LISTS } from './finder.js';

const mk = (id, light, place, safe = false, difficulty = 'fácil') => ({
  id,
  data: {
    traits: { light, place },
    difficulty,
    toxicity: { cats: safe ? 'no-toxica' : 'toxica', dogs: safe ? 'no-toxica' : 'toxica' },
  },
});

test('filters combine', () => {
  const p = mk('a', ['semisombra', 'sombra'], ['interior'], true).data;
  assert.ok(matches(p, {}));
  assert.ok(matches(p, { light: 'sombra', place: 'interior', petSafe: true }));
  assert.ok(!matches(p, { light: 'sol' }));
  assert.ok(!matches(p, { place: 'exterior' }));
  assert.ok(!matches(p, { difficulty: 'exigente' }));
  assert.ok(isPetSafe(p));
  assert.ok(!isPetSafe({ toxicity: { cats: 'no-toxica', dogs: 'toxica' } }));
  assert.ok(!isPetSafe({ toxicity: { cats: 'variable', dogs: 'variable' } }));
});

test('lists below the minimum are not published', () => {
  const plants = [mk('a', ['sol'], ['exterior']), mk('b', ['sol'], ['exterior'])];
  assert.deepEqual(listsToPublish(plants, 3), []);
  assert.equal(listsToPublish(plants, 2)[0].slug, 'plantas-de-sol');
});

test('lists with identical members keep only the first (higher priority)', () => {
  const plants = Array.from({ length: 8 }, (_, i) => mk(`p${i}`, ['sombra'], ['interior'], true));
  const slugs = listsToPublish(plants).map((l) => l.slug);
  assert.deepEqual(slugs, ['plantas-de-interior-poca-luz']);
});

test('indoor plants never fill the garden shade list', () => {
  const plants = Array.from({ length: 8 }, (_, i) => mk(`p${i}`, ['sombra'], ['interior']));
  assert.ok(!listsToPublish(plants).some((l) => l.slug === 'plantas-de-sombra'));
});

test('list slugs are unique', () => {
  assert.equal(new Set(LISTS.map((l) => l.slug)).size, LISTS.length);
});
