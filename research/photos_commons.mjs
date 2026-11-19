// Finds freely licensed photo candidates on Wikimedia Commons and builds contact sheets for manual review.
// Usage: node research/photos_commons.mjs <outDir>   (writes candidates.json, cand/*.jpg, sheet-*.jpg)
import fs from 'node:fs';
import sharp from 'sharp';

const OUT = process.argv[2];
const ONLY = process.argv.slice(3); // optional: limit to these slugs
const UA = 'HojapediaBot/0.1 (https://hojapedia.com; attributed reuse of freely licensed images)';
const API = 'https://commons.wikimedia.org/w/api.php';
const ALLOWED = /^(CC0|Public domain|PD|CC BY(-SA)? \d\.\d|CC BY(-SA)? \d\.\d [a-z]{2,}|CC BY(-SA)?)/i;

const TARGETS = {
  orquidea: ['Phalaenopsis'], sansevieria: ['Sansevieria trifasciata', 'Dracaena trifasciata'], potus: ['Epipremnum aureum'],
  dracaena: ['Dracaena fragrans'], anturio: ['Anthurium andraeanum'], kalanchoe: ['Kalanchoe blossfeldiana'], espatifilo: ['Spathiphyllum'],
  nochebuena: ['Euphorbia pulcherrima'], 'arbol-de-jade': ['Crassula ovata'], lavanda: ['Lavandula angustifolia Hidcote', 'Lavandula angustifolia Munstead', 'Lavandula angustifolia'], geranio: ['Pelargonium zonale', 'Pelargonium hortorum'],
  azalea: ['Rhododendron azalea', 'Azalea'], 'aloe-vera': ['Aloe vera'], 'cactus-de-navidad': ['Schlumbergera'], calathea: ['Goeppertia', 'Calathea'],
  cheflera: ['Schefflera arboricola', 'Heptapleurum arboricola'], ciclamen: ['Cyclamen persicum'], albahaca: ['Ocimum basilicum'], romero: ['Rosmarinus officinalis', 'Salvia rosmarinus'],
  gerbera: ['Gerbera jamesonii', 'Gerbera'], aglaonema: ['Aglaonema'], cinta: ['Chlorophytum comosum'], filodendro: ['Philodendron hederaceum'],
  maranta: ['Maranta leuconeura'], peperomia: ['Peperomia obtusifolia'],
  tulipan: ['Tulipa gesneriana', 'Tulipa'], crisantemo: ['Chrysanthemum morifolium', 'Chrysanthemum × morifolium'], jazmin: ['Jasminum officinale', 'Jasminum polyanthum'],
  suculentas: ['Echeveria', 'Succulent plants'],
  pulgones: ['Aphid'], cochinilla: ['Mealybug', 'Pseudococcidae'], perlita: ['Perlite'], 'tierra-para-plantas': ['Potting soil'], 'humus-de-lombriz': ['Vermicompost'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Polite fetch: one request at a time, waits and retries on HTTP 429 (Wikimedia rate limit).
async function politeFetch(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429) return res;
    const wait = Math.max(Number(res.headers.get('retry-after')) * 1000 || 0, 30000 * attempt);
    console.error(`429, waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error('HTTP 429 after retries');
}
const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function search(query) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '20',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '330',
  });
  const res = await politeFetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Object.values(json.query?.pages ?? {}).map((p) => {
    const ii = p.imageinfo?.[0] ?? {};
    const m = ii.extmetadata ?? {};
    return {
      title: p.title, index: p.index ?? 99, width: ii.width, height: ii.height, mime: ii.mime,
      thumb: ii.thumburl, page: ii.descriptionurl,
      license: m.LicenseShortName?.value ?? '', licenseUrl: m.LicenseUrl?.value ?? '',
      author: strip(m.Artist?.value), credit: strip(m.Credit?.value), description: strip(m.ImageDescription?.value).slice(0, 160),
    };
  }).sort((a, b) => a.index - b.index);
}

const usable = (c) => c.mime === 'image/jpeg' && c.width >= 1200 && c.width >= c.height * 0.75 && ALLOWED.test(c.license) && c.thumb && c.author;

fs.mkdirSync(`${OUT}/cand`, { recursive: true });
const all = fs.existsSync(`${OUT}/candidates.json`) ? JSON.parse(fs.readFileSync(`${OUT}/candidates.json`, 'utf8')) : {};
for (const [slug, names] of Object.entries(TARGETS)) {
  if (ONLY.length && !ONLY.includes(slug)) continue;
  const picked = all[slug]?.length ? all[slug] : [];
  for (const name of names) {
    for (const q of [`"${name}" incategory:Quality_images`, `"${name}" incategory:Featured_pictures_on_Wikimedia_Commons`, `"${name}"`]) {
      if (picked.length >= 3) break;
      try {
        for (const c of await search(q)) if (usable(c) && !picked.some((p) => p.title === c.title) && picked.length < 3) picked.push({ ...c, query: q });
      } catch (e) { console.error(slug, q, e.message); }
      await sleep(1500);
    }
  }
  all[slug] = picked;
  fs.writeFileSync(`${OUT}/candidates.json`, JSON.stringify(all, null, 1));
  for (const [i, c] of picked.entries()) {
    const file = `${OUT}/cand/${slug}-${i}.jpg`;
    if (fs.existsSync(file)) continue;
    let res;
    try { res = await politeFetch(c.thumb); } catch (e) { console.error(slug, i, e.message); continue; }
    if (res.ok) fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    else console.error(slug, i, 'thumb HTTP', res.status);
    await sleep(4000);
  }
  console.log(slug.padEnd(20), picked.map((c) => `${c.license} | ${c.title.slice(5, 55)}`).join('  ||  ') || 'NONE');
}
fs.writeFileSync(`${OUT}/candidates.json`, JSON.stringify(all, null, 1));

// Contact sheets: one row per slug, up to 3 candidates, labelled.
const slugs = ONLY.length ? ONLY : Object.keys(all);
for (let s = 0; s < slugs.length; s += 6) {
  const rows = slugs.slice(s, s + 6);
  const W = 300, H = 210, LABEL = 22;
  const composites = [];
  rows.forEach((slug, r) => {
    composites.push({ input: Buffer.from(`<svg width="${W * 3}" height="${LABEL}"><rect width="100%" height="100%" fill="#fff"/><text x="4" y="16" font-size="15" font-family="sans-serif">${slug}</text></svg>`), left: 0, top: r * (H + LABEL) });
    for (let i = 0; i < 3; i++) {
      const f = `${OUT}/cand/${slug}-${i}.jpg`;
      if (fs.existsSync(f)) composites.push({ input: f, left: i * W, top: r * (H + LABEL) + LABEL, _resize: true });
    }
  });
  const prepared = await Promise.all(composites.map(async (c) => c._resize ? { input: await sharp(c.input).resize(W - 4, H - 4, { fit: 'cover' }).toBuffer(), left: c.left + 2, top: c.top + 2 } : c));
  await sharp({ create: { width: W * 3, height: rows.length * (H + LABEL), channels: 3, background: '#ddd' } }).composite(prepared).jpeg({ quality: 80 }).toFile(`${OUT}/sheet-${s / 6}.jpg`);
}
console.log('sheets done');
