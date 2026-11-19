// Demand for tool-type queries in Spanish (read-only Keyword Planner). Run from /opt/google-ads-mcp with its .env loaded.
import { googleAdsRequest } from "/opt/google-ads-mcp/src/googleAdsClient.js";
import { readConfigFromEnv } from "/opt/google-ads-mcp/src/googleAuth.js";
import fs from "node:fs";

const GEOS = [2724, 2484, 2840, 2032, 2170, 2152, 2604].map((g) => `geoTargetConstants/${g}`); // ES MX US AR CO CL PE
const GROUPS = {
  identificar: ["identificar plantas", "identificar planta por foto", "identificador de plantas", "app para identificar plantas", "que planta es esta", "reconocer plantas por foto", "aplicacion para identificar plantas", "plantnet", "picture this"],
  riego: ["cada cuanto regar las plantas", "cuanto regar una planta", "calculadora de riego", "recordatorio de riego plantas", "app para regar plantas", "cuando regar las plantas", "como saber si una planta necesita agua"],
  calendario: ["calendario de siembra", "calendario lunar siembra", "calendario de siembra 2026", "que sembrar en noviembre", "que sembrar en primavera", "que plantar en otoño", "calendario de siembra argentina", "calendario de siembra chile", "calendario de siembra mexico", "calendario de siembra españa", "que sembrar este mes"],
  sustrato: ["cuanta tierra necesito", "calcular tierra para maceta", "litros de tierra por maceta", "calculadora de sustrato", "cuantos litros de tierra necesita una maceta", "tamaño de maceta"],
  abono: ["calculadora de abono", "cuanto abono echar", "dosis de abono", "como abonar las plantas", "cada cuanto abonar las plantas"],
  luz: ["plantas de interior poca luz", "plantas para poca luz", "plantas de sombra", "plantas de sol", "que planta me conviene", "plantas segun la luz", "plantas faciles de cuidar", "plantas de interior faciles"],
  mascotas: ["plantas toxicas para gatos", "plantas toxicas para perros", "plantas seguras para gatos", "plantas no toxicas para gatos", "plantas seguras para perros", "plantas venenosas para perros"],
  huerto: ["cuantas plantas por metro cuadrado", "marco de plantacion", "calculadora de huerto", "distancia entre plantas de tomate", "asociacion de cultivos", "calendario de huerto"],
  diagnostico: ["por que mi planta tiene hojas amarillas", "hojas amarillas plantas", "puntas secas hojas", "hojas marrones plantas", "mi planta se esta muriendo", "plantas con hojas caidas", "manchas blancas en las hojas"],
};
const c = readConfigFromEnv();
const all = [...new Set(Object.values(GROUPS).flat())];
const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordHistoricalMetrics", body: { keywords: all, language: "languageConstants/1003", geoTargetConstants: GEOS, keywordPlanNetwork: "GOOGLE_SEARCH" } });
const vol = {};
for (const x of r.results ?? []) {
  const m = x.keywordMetrics ?? {};
  vol[x.text] = { v: Number(m.avgMonthlySearches ?? 0), comp: m.competition ?? "", close: (x.closeVariants ?? []).join("|") };
}
const out = {};
for (const [g, kws] of Object.entries(GROUPS)) {
  out[g] = kws.map((k) => ({ k, ...(vol[k] ?? { v: null }) })).sort((a, b) => (b.v ?? -1) - (a.v ?? -1));
  console.log(`\n${g}`);
  for (const x of out[g]) console.log(`  ${String(x.v).padStart(7)}  ${x.comp.padEnd(7)} ${x.k}`);
}
fs.writeFileSync("/opt/plantas-es/research/tools_kw_es.json", JSON.stringify(out, null, 1));
