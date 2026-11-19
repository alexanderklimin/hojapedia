import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_EMAIL, OWNER_NAME, OWNER_COUNTRY } from '../data/site.js';

test('contact email is set', () => {
  assert.match(CONTACT_EMAIL, /^[^@\s]+@hojapedia\.com$/);
});

// Launch gate: the legal pages must name the owner before the site goes public.
test('owner data for legal pages', { skip: process.env.LAUNCH !== '1' && 'solo se exige con LAUNCH=1' }, () => {
  assert.ok(OWNER_NAME.trim().length > 2, 'Falta OWNER_NAME');
  assert.ok(OWNER_COUNTRY.trim().length > 2, 'Falta OWNER_COUNTRY');
});
