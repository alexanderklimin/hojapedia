// Downloads the manually chosen Commons candidates at 1280px and writes src/data/photos.json.
// Usage: node research/photos_finalize.mjs <candidatesDir>
import fs from 'node:fs';
import sharp from 'sharp';

const DIR = process.argv[2];
const UA = 'HojapediaBot/0.1 (https://hojapedia.com; attributed reuse of freely licensed images)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OUT = new URL('../src/assets/photos/', import.meta.url);
const DATA = new URL('../src/data/photos.json', import.meta.url);

// slug: [candidate index, Spanish alt text] — chosen by looking at the contact sheets.
const CHOICES = {
  orquidea: [0, 'Orquídea Phalaenopsis de flores blancas'],
  sansevieria: [0, 'Sansevieria de hojas con borde amarillo junto a una ventana'],
  potus: [0, 'Hojas de potus verdes con jaspeado amarillo'],
  dracaena: [0, 'Dracena de hojas largas con bordes amarillos en maceta'],
  anturio: [0, 'Flor roja de anturio con su espádice amarillo'],
  kalanchoe: [0, 'Flores rosas dobles de kalanchoe'],
  espatifilo: [0, 'Flor blanca de espatifilo'],
  nochebuena: [0, 'Brácteas rojas de flor de Pascua'],
  'arbol-de-jade': [2, 'Hojas carnosas del árbol de jade'],
  lavanda: [2, 'Mariposa sobre flores de lavanda'],
  geranio: [0, 'Geranio zonal de hojas variegadas con flores'],
  azalea: [2, 'Flores rosadas de rododendro'],
  'aloe-vera': [2, 'Mata de aloe vera'],
  'cactus-de-navidad': [0, 'Flor roja de cactus de Navidad'],
  calathea: [2, 'Hojas de Goeppertia (calathea) con flor'],
  cheflera: [2, 'Cheflera en maceta blanca'],
  ciclamen: [2, 'Flores rosas de ciclamen'],
  albahaca: [0, 'Planta de albahaca con hojas verdes'],
  romero: [0, 'Arbusto de romero en una ladera'],
  gerbera: [1, 'Flores rojas de gerbera'],
  aglaonema: [1, 'Aglaonemas de hojas rojas y verdes'],
  cinta: [1, 'Cinta (malamadre) con hojas rayadas y flores blancas'],
  filodendro: [1, 'Hojas acorazonadas de filodendro trepador'],
  maranta: [0, 'Hojas manchadas de maranta'],
  peperomia: [2, 'Peperomia obtusifolia de hojas redondas y brillantes'],
  pulgones: [0, 'Pulgones verdes vistos de cerca'],
  cochinilla: [0, 'Cochinillas algodonosas en un tallo'],
  perlita: [1, 'Granos blancos de perlita'],
  'tierra-para-plantas': [0, 'Plántulas creciendo en sustrato'],
  'humus-de-lombriz': [0, 'Lombrices en vermicompost'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function politeFetch(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429) return res;
    const wait = Math.max(Number(res.headers.get('retry-after')) * 1000 || 0, 30000 * attempt);
    console.error(`429, waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error('HTTP 429 after retries');
}

const candidates = JSON.parse(fs.readFileSync(`${DIR}/candidates.json`, 'utf8'));
const photos = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : {};
for (const [slug, [index, alt]] of Object.entries(CHOICES)) {
  const c = candidates[slug]?.[index];
  if (!c) { console.error(slug, 'no candidate'); continue; }
  const file = `${slug}.jpg`;
  if (!fs.existsSync(new URL(file, OUT))) {
    // Original file (already stored, not re-rendered) and resize locally: thumbnail requests are rate-limited.
    const original = c.thumb.split('?')[0].replace(/^https:\/\/[^/]+/, 'https://upload.wikimedia.org').replace(/\/thumb(\/.+?)\/[^/]+$/, '$1');
    let res;
    try { res = await politeFetch(original); } catch (e) { console.error(slug, e.message); await sleep(120000); continue; }
    if (!res.ok) { console.error(slug, 'HTTP', res.status); continue; }
    const buffer = Buffer.from(await res.arrayBuffer());
    await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(new URL(file, OUT).pathname);
    await sleep(60000);
  }
  photos[slug] = { file, title: c.title, author: c.author.slice(0, 120), license: c.license, licenseUrl: c.licenseUrl || undefined, source: c.page, alt };
  fs.writeFileSync(DATA, JSON.stringify(photos, null, 2) + '\n');
  console.log('ok', slug, c.license, '|', c.author.slice(0, 50));
}
