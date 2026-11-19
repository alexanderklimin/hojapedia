// Plant demand in Spanish (read-only Keyword Planner). Run from /opt/google-ads-mcp with its .env loaded.
// 1) plant x intent matrix (exact historical metrics), 2) keyword ideas for generic clusters, 3) buyer-intent goods.
import { googleAdsRequest } from "/opt/google-ads-mcp/src/googleAdsClient.js";
import { readConfigFromEnv } from "/opt/google-ads-mcp/src/googleAuth.js";
import fs from "node:fs";

const DIR = "/opt/plantas-es/research/";
const CLP = 950; // account currency is CLP; bids converted to USD approximately
const GEOS = [2724, 2484, 2840, 2032, 2170, 2152, 2604].map((g) => `geoTargetConstants/${g}`); // ES MX US AR CO CL PE
const c = readConfigFromEnv();

// Each plant: [id, ...names used in searches]; regional synonyms are merged into one page.
const PLANTS = [
  ["potus", "potus", "poto", "pothos"], ["monstera", "monstera", "costilla de adan"], ["sansevieria", "lengua de suegra", "sansevieria", "espada de san jorge"],
  ["aloe-vera", "aloe vera", "sabila", "zabila"], ["orquidea", "orquidea", "orquideas"], ["suculentas", "suculentas", "suculenta"], ["cactus", "cactus"],
  ["espatifilo", "espatifilo", "cuna de moises", "lirio de la paz"], ["anturio", "anturio", "anturios"], ["helecho", "helecho", "helechos"], ["cinta", "cinta", "malamadre", "mala madre"],
  ["dracaena", "dracaena", "palo de agua", "palo de brasil", "tronco de brasil"], ["zamioculca", "zamioculca", "zamioculcas"], ["calathea", "calathea"], ["aglaonema", "aglaonema"],
  ["alocasia", "alocasia"], ["filodendro", "filodendro", "philodendron"], ["peperomia", "peperomia"], ["pilea", "pilea"], ["hiedra", "hiedra"], ["croton", "croton"],
  ["yuca", "yuca planta", "izote"], ["areca", "areca", "palmera areca"], ["kentia", "kentia"], ["pata-de-elefante", "pata de elefante"], ["kalanchoe", "kalanchoe"],
  ["begonia", "begonia", "begonias"], ["geranio", "geranio", "geranios", "malvon"], ["rosal", "rosal", "rosas", "rosales"], ["lavanda", "lavanda"], ["romero", "romero"],
  ["albahaca", "albahaca"], ["menta", "menta"], ["hierbabuena", "hierbabuena"], ["jazmin", "jazmin"], ["buganvilla", "buganvilla", "bugambilia", "santa rita"],
  ["hortensia", "hortensia", "hortensias"], ["gardenia", "gardenia"], ["azalea", "azalea"], ["camelia", "camelia"], ["bonsai", "bonsai"], ["ficus", "ficus"],
  ["ficus-lyrata", "ficus lyrata"], ["ficus-benjamina", "ficus benjamina"], ["gomero", "gomero", "ficus elastica", "arbol del caucho"], ["echeveria", "echeveria"],
  ["cola-de-burro", "cola de burro"], ["violeta-africana", "violeta africana"], ["bromelia", "bromelia"], ["tillandsia", "tillandsia", "clavel del aire"],
  ["dipladenia", "dipladenia", "mandevilla"], ["petunia", "petunia", "petunias"], ["margarita", "margarita planta", "margaritas"], ["girasol", "girasol"], ["tulipan", "tulipan", "tulipanes"],
  ["lirio", "lirio"], ["cala", "cala", "alcatraz", "calas"], ["clavel", "clavel", "claveles"], ["crisantemo", "crisantemo"], ["gerbera", "gerbera"], ["ciclamen", "ciclamen"],
  ["hibisco", "hibisco", "cayena", "rosa de china"], ["plumeria", "plumeria", "frangipani"], ["limonero", "limonero", "arbol de limon"], ["naranjo", "naranjo"], ["olivo", "olivo"],
  ["laurel", "laurel"], ["ruda", "ruda"], ["citronela", "citronela"], ["stevia", "stevia"], ["cilantro", "cilantro"], ["perejil", "perejil"], ["oregano", "oregano"], ["tomillo", "tomillo"],
  ["arbol-de-la-felicidad", "arbol de la felicidad"], ["coleo", "coleo", "cretona"], ["singonio", "singonio", "syngonium"], ["maranta", "maranta"], ["helecho-de-boston", "helecho de boston"],
  ["cactus-de-navidad", "cactus de navidad", "flor de mayo"], ["nochebuena", "nochebuena", "flor de pascua", "poinsettia"], ["planta-del-dinero", "planta del dinero", "millonaria", "planta del dolar"],
  ["bambu-de-la-suerte", "bambu de la suerte"], ["rosa-del-desierto", "rosa del desierto", "adenium"], ["arbol-de-jade", "arbol de jade", "planta de jade", "crasula"],
  ["cheflera", "cheflera", "schefflera"], ["lantana", "lantana"], ["galan-de-noche", "galan de noche", "dama de noche"], ["tradescantia", "tradescantia", "amor de hombre"],
  ["strelitzia", "ave del paraiso", "strelitzia"], ["fresa", "planta de fresa", "fresas en maceta"], ["tomate", "tomatera", "planta de tomate"], ["aguacate", "arbol de aguacate", "arbol de palta"],
  ["mango", "arbol de mango"], ["agave", "agave", "maguey"], ["nopal", "nopal"], ["sabila-planta", "planta de sabila"], ["calendula", "calendula"], ["manzanilla", "manzanilla planta"],
  ["cactus-san-pedro", "san pedro cactus"], ["planta-carnivora", "planta carnivora", "plantas carnivoras", "venus atrapamoscas"], ["musgo", "musgo"], ["pasto", "pasto", "cesped"],
];
const INTENTS = [
  ["base", (p) => p], ["cuidados", (p) => `${p} cuidados`], ["cuidados", (p) => `cuidados de ${p}`], ["cuidados", (p) => `como cuidar ${p}`],
  ["riego", (p) => `${p} riego`], ["riego", (p) => `cada cuanto se riega ${p}`], ["reproducir", (p) => `como reproducir ${p}`], ["reproducir", (p) => `esquejes de ${p}`],
  ["hojas-amarillas", (p) => `${p} hojas amarillas`], ["hojas-amarillas", (p) => `${p} hojas secas`], ["toxica", (p) => `${p} toxica para gatos`], ["toxica", (p) => `${p} toxica para perros`],
  ["luz", (p) => `${p} sol o sombra`], ["luz", (p) => `${p} interior o exterior`], ["significado", (p) => `${p} significado`], ["plantar", (p) => `como plantar ${p}`],
  ["poda", (p) => `como podar ${p}`], ["flor", (p) => `como hacer florecer ${p}`], ["beneficios", (p) => `${p} beneficios`], ["tipos", (p) => `tipos de ${p}`],
];

async function hist(keywords) {
  const map = new Map();
  for (let i = 0; i < keywords.length; i += 700) {
    const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordHistoricalMetrics", body: { keywords: keywords.slice(i, i + 700), language: "languageConstants/1003", geoTargetConstants: GEOS, keywordPlanNetwork: "GOOGLE_SEARCH" } });
    for (const x of r.results || []) {
      const m = { v: +(x.keywordMetrics?.avgMonthlySearches || 0), hi: +(x.keywordMetrics?.highTopOfPageBidMicros || 0) / 1e6 / CLP, group: [x.text, ...(x.closeVariants || [])].sort()[0] };
      map.set(x.text, m);
      for (const y of x.closeVariants || []) map.set(y, m);
    }
    await new Promise((s) => setTimeout(s, 1300));
  }
  return map;
}

// 1. Matrix
const kw = [];
for (const [id, ...names] of PLANTS) for (const n of names) for (const [intent, f] of INTENTS) kw.push({ id, intent, k: f(n) });
const m = await hist([...new Set(kw.map((x) => x.k))]);
const matrix = [];
const seen = new Set();
for (const x of kw) {
  const r = m.get(x.k);
  if (!r) continue;
  const key = `${x.id}|${r.group}`;
  if (seen.has(key)) continue;
  seen.add(key);
  matrix.push({ ...x, v: r.v, hi: r.hi });
}
fs.writeFileSync(DIR + "plants_matrix_es.json", JSON.stringify(matrix, null, 1));
const byPlant = {};
for (const x of matrix) {
  const p = (byPlant[x.id] ||= { id: x.id, total: 0, care: 0, intents: {} });
  p.total += x.v;
  if (x.intent !== "base") p.care += x.v;
  p.intents[x.intent] = (p.intents[x.intent] || 0) + x.v;
}
const plants = Object.values(byPlant).sort((a, b) => b.care - a.care);
console.log("matrix keywords", kw.length, "| with data", matrix.length, "| plants", plants.length);
console.log("plants with care-intent >=1000:", plants.filter((p) => p.care >= 1000).length, "| >=300:", plants.filter((p) => p.care >= 300).length, "| care sum", plants.reduce((s, p) => s + p.care, 0), "| base sum", plants.reduce((s, p) => s + (p.intents.base || 0), 0));
console.log("top by care intent:", plants.slice(0, 40).map((p) => `${p.id} ${p.care}`).join("; "));
const intentSum = {};
for (const x of matrix) if (x.intent !== "base") intentSum[x.intent] = (intentSum[x.intent] || 0) + x.v;
console.log("by intent:", Object.entries(intentSum).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("; "));

// 2. Generic clusters via keyword ideas
const CLUSTERS = {
  plagas: { seeds: ["como eliminar la cochinilla", "pulgon en plantas", "mosca blanca", "araña roja plantas", "hongos en plantas", "mosquitos en las macetas"], re: /cochinilla|pulg[oó]n|mosca|araña|hongo|plaga|mosquit|caracol|babosa|trips|insecticida/ },
  abono: { seeds: ["abono casero", "fertilizante casero para plantas", "cascara de huevo para plantas", "posos de cafe para plantas", "humus de lombriz"], re: /abono|fertiliz|cascara|posos|cafe para|humus|compost|vermicompost/ },
  listas: { seeds: ["plantas de interior que no necesitan luz", "plantas para baño", "plantas colgantes", "plantas de sol", "plantas que purifican el aire", "plantas toxicas para gatos"], re: /plantas? (de|para|que|colgantes|toxicas|resistentes|faciles|aromaticas|medicinales|trepadoras|con flores)/ },
  problemas: { seeds: ["por que mi planta tiene hojas amarillas", "puntas secas en las plantas", "planta con hojas caidas", "exceso de riego plantas", "como revivir una planta"], re: /hojas|puntas|revivir|riego|marchit|pudr|seca|caid/ },
  huerto: { seeds: ["huerto en casa", "huerto urbano", "que sembrar en noviembre", "calendario de siembra", "como germinar semillas"], re: /huerto|sembrar|siembra|germin|semill|cultivar|plantar/ },
  sustrato: { seeds: ["sustrato para suculentas", "tierra para plantas", "perlita", "como trasplantar una planta", "macetas con drenaje"], re: /sustrato|tierra|perlita|turba|vermiculita|trasplant|maceta|drenaje|fibra de coco/ },
};
const clusters = {};
for (const [name, { seeds, re }] of Object.entries(CLUSTERS)) {
  const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordIdeas", body: { language: "languageConstants/1003", geoTargetConstants: GEOS, keywordPlanNetwork: "GOOGLE_SEARCH", keywordSeed: { keywords: seeds }, pageSize: 5000 } });
  const s2 = new Set();
  const rows = (r.results || []).map((x) => ({ k: x.text, v: +(x.keywordIdeaMetrics?.avgMonthlySearches || 0), hi: +(x.keywordIdeaMetrics?.highTopOfPageBidMicros || 0) / 1e6 / CLP })).filter((x) => re.test(x.k)).sort((a, b) => b.v - a.v).filter((x) => { const s = `${x.v}|${x.hi.toFixed(4)}`; if (s2.has(s)) return false; s2.add(s); return true; });
  clusters[name] = rows;
  console.log(`[${name}] uniq ${rows.length} | sum ${rows.reduce((s, x) => s + x.v, 0)} | >=1k ${rows.filter((x) => x.v >= 1000).length} | >=100 ${rows.filter((x) => x.v >= 100).length} | ${rows.slice(0, 8).map((x) => `${x.k} ${x.v}`).join("; ")}`);
  await new Promise((s) => setTimeout(s, 1500));
}
fs.writeFileSync(DIR + "plants_clusters_es.json", JSON.stringify(clusters, null, 1));
