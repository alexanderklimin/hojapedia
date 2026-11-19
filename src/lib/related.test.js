import test from 'node:test';
import assert from 'node:assert/strict';
import { mentions, guidesForPlant, plantsForGuide, guidePath } from './related.js';

const plant = {
  care: {
    substrate: { short: 'Aireado', text: 'Turba, arena y Perlita.', pot: 'Con drenaje' },
    fertilizer: { short: 'Mensual', text: 'Abono líquido.' },
  },
  problems: [{ symptom: 'Bolitas blancas', cause: 'Cochinilla algodonosa.', fix: 'Retirar.' }],
};
const pulgones = { kind: 'plaga', keywords: ['pulgón', 'pulgones'] };
const cochinilla = { kind: 'plaga', keywords: ['cochinilla'] };
const perlita = { kind: 'sustrato', keywords: ['perlita'] };
const humus = { kind: 'abono', keywords: ['humus de lombriz'] };

test('matches accents, case and word starts only', () => {
  assert.ok(mentions('Hay PULGONES en los brotes', ['pulgon']));
  assert.ok(mentions('pulgón negro', ['pulgón']));
  assert.ok(!mentions('superlitas', ['perlita']));
  assert.ok(!mentions('', ['perlita']));
});

test('pests are matched in problems, media in substrate text', () => {
  assert.deepEqual(guidesForPlant(plant, [pulgones, cochinilla, perlita, humus]), [cochinilla, perlita]);
});

test('perlita in problems does not link a substrate guide', () => {
  const other = { ...plant, care: { ...plant.care, substrate: { short: '', text: 'Sustrato universal', pot: '' } } };
  assert.deepEqual(guidesForPlant(other, [perlita]), []);
});

test('reverse links and paths', () => {
  assert.equal(plantsForGuide(cochinilla, [{ id: 'jade', data: plant }]).length, 1);
  assert.equal(guidePath('plaga', 'pulgones'), '/plagas/pulgones/');
  assert.equal(guidePath('sustrato', 'perlita'), '/sustratos-y-macetas/perlita/');
});
