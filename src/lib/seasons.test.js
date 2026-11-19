import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonMonths, seasonOf, monthRange, growingSeason } from './seasons.js';

test('seasons are inverted between hemispheres', () => {
  assert.deepEqual(seasonMonths('primavera', 'norte'), [3, 4, 5]);
  assert.deepEqual(seasonMonths('primavera', 'sur'), [9, 10, 11]);
  assert.deepEqual(seasonMonths('invierno', 'sur'), [6, 7, 8]);
  assert.deepEqual(seasonMonths('verano', 'sur'), [12, 1, 2]);
});

test('every month maps to opposite seasons', () => {
  const opposite = { primavera: 'otono', otono: 'primavera', verano: 'invierno', invierno: 'verano' };
  for (let m = 1; m <= 12; m += 1) assert.equal(seasonOf(m, 'sur'), opposite[seasonOf(m, 'norte')]);
  assert.equal(seasonOf(1, 'norte'), 'invierno');
  assert.equal(seasonOf(1, 'sur'), 'verano');
  assert.equal(seasonOf(7, 'sur'), 'invierno');
});

test('month ranges read naturally', () => {
  assert.equal(monthRange(['primavera', 'verano'], 'norte'), 'de marzo a agosto');
  assert.equal(monthRange(['primavera', 'verano'], 'sur'), 'de septiembre a febrero');
  assert.deepEqual(growingSeason(), { norte: 'de marzo a agosto', sur: 'de septiembre a febrero' });
});

test('invalid input throws', () => {
  assert.throws(() => seasonOf(13, 'norte'), RangeError);
  assert.throws(() => seasonOf(3, 'este'), RangeError);
  assert.throws(() => seasonMonths('monzón', 'sur'), RangeError);
});
