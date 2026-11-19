// Plant finder and auto-generated lists. Framework-free and tested.
// A list page is published only when enough plants qualify (thin pages hurt SEO)
// and only if no higher-priority list already has exactly the same plants (duplicate intent).

export const MIN_LIST_PLANTS = 8;

export const isPetSafe = (plant) => plant.toxicity.cats === 'no-toxica' && plant.toxicity.dogs === 'no-toxica';

// filters: { light?: 'sol'|'semisombra'|'sombra', place?: 'interior'|'exterior', petSafe?: boolean, difficulty?: string }
export function matches(plant, filters = {}) {
  const { light, place, petSafe, difficulty } = filters;
  if (light && !plant.traits.light.includes(light)) return false;
  if (place && !plant.traits.place.includes(place)) return false;
  if (petSafe && !isPetSafe(plant)) return false;
  if (difficulty && plant.difficulty !== difficulty) return false;
  return true;
}

// Ordered by priority (search demand, Keyword Planner 2026-11-19, ES+LatAm).
export const LISTS = Object.freeze([
  {
    // "plantas de sombra" is mostly searched for gardens and terraces, not for indoor plants.
    slug: 'plantas-de-sombra',
    filters: { light: 'sombra', place: 'exterior' },
    title: 'Plantas de sombra para jardín y terraza',
    h1: 'Plantas de sombra para jardín y terraza',
    lead: 'Plantas de exterior que toleran sombra, con su ficha de cuidados y si son seguras para gatos y perros.',
  },
  {
    slug: 'plantas-de-sol',
    filters: { light: 'sol' },
    title: 'Plantas de sol: cuáles aguantan sol directo',
    h1: 'Plantas de sol',
    lead: 'Plantas que necesitan o toleran varias horas de sol directo, con su ficha de cuidados.',
  },
  {
    slug: 'plantas-de-interior-poca-luz',
    filters: { light: 'sombra', place: 'interior' },
    title: 'Plantas de interior para poca luz',
    h1: 'Plantas de interior para poca luz',
    lead: 'Plantas de interior que toleran rincones con poca luz, según fuentes botánicas y universitarias citadas en cada ficha.',
  },
  {
    slug: 'plantas-de-interior-seguras-para-gatos',
    filters: { place: 'interior', petSafe: true },
    title: 'Plantas de interior seguras para gatos y perros',
    h1: 'Plantas de interior seguras para gatos y perros',
    lead: 'Plantas de interior que la ASPCA clasifica como no tóxicas para gatos y perros.',
  },
]);

const key = (plants) => plants.map((p) => p.id).sort().join(',');

// plants: [{ id, data }] as returned by getCollection.
export function listsToPublish(plants, min = MIN_LIST_PLANTS) {
  const seen = new Set();
  const out = [];
  for (const list of LISTS) {
    const members = plants.filter((p) => matches(p.data, list.filters));
    const k = key(members);
    if (members.length < min || seen.has(k)) continue;
    seen.add(k);
    out.push({ ...list, plants: members });
  }
  return out;
}
