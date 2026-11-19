// Two-way links between plant cards and guides (pests, growing media, fertilizers),
// based on keywords found in the plant's own text. Framework-free and tested.

export const GUIDE_SECTIONS = Object.freeze({
  plaga: { path: '/plagas/', label: 'Plagas' },
  sustrato: { path: '/sustratos-y-macetas/', label: 'Sustratos y macetas' },
  abono: { path: '/abonos/', label: 'Abonos' },
});

export const guidePath = (kind, slug) => `${GUIDE_SECTIONS[kind].path}${slug}/`;

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// The plant text that may mention a guide: problems for pests, care for media and fertilizers.
export function plantText(plant, kind) {
  if (kind === 'plaga') return plant.problems.map((p) => `${p.symptom} ${p.cause} ${p.fix}`).join(' ');
  const { substrate, fertilizer } = plant.care;
  return kind === 'sustrato' ? `${substrate.short} ${substrate.text} ${substrate.pot}` : `${fertilizer.short} ${fertilizer.text}`;
}

// Whole-word-start match so "pulgón" matches "pulgones" but "perlita" does not match "superlitas".
export function mentions(text, keywords) {
  const haystack = normalize(text);
  return keywords.some((keyword) => new RegExp(`(^|[^a-z])${normalize(keyword)}`).test(haystack));
}

export function guidesForPlant(plant, guides) {
  return guides.filter((guide) => mentions(plantText(plant, guide.kind), guide.keywords));
}

export function plantsForGuide(guide, plants) {
  return plants.filter((plant) => mentions(plantText(plant.data, guide.kind), guide.keywords));
}
