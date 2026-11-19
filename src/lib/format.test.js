import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, petLabel, petVerdict, temperatureLine } from './format.js';

test('dates in Spanish', () => {
  assert.equal(formatDate('2026-11-19'), '19 de noviembre de 2026');
  assert.throws(() => formatDate('19/11/2026'), RangeError);
});

test('pet labels and verdicts', () => {
  assert.equal(petLabel('toxica'), 'Tóxica');
  assert.equal(petLabel('no-toxica'), 'No tóxica');
  assert.throws(() => petLabel('quizá'), RangeError);
  assert.deepEqual(petVerdict({ cats: 'no-toxica', dogs: 'no-toxica' }), { tone: 'ok', text: 'No tóxica para gatos ni perros' });
  assert.equal(petVerdict({ cats: 'toxica', dogs: 'toxica' }).text, 'Tóxica para gatos y perros');
  assert.equal(petVerdict({ cats: 'toxica', dogs: 'no-toxica' }).text, 'Tóxica para gatos');
  assert.equal(petVerdict({ cats: 'no-toxica', dogs: 'toxica' }).tone, 'bad');
});

test('temperature never shows an invented minimum', () => {
  assert.equal(temperatureLine({ minC: null, idealMinC: 15, idealMaxC: 24 }), '15–24 °C');
  assert.equal(temperatureLine({ minC: 16, idealMinC: 16, idealMaxC: 30 }), '16–30 °C (mínimo 16 °C)');
  assert.equal(temperatureLine({ minC: null, idealMinC: null, idealMaxC: null, short: 'Resistente al frío' }), 'Resistente al frío');
});
