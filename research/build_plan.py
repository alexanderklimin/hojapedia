"""Builds research/content_plan.csv for the plants site from Keyword Planner data (run: python3 -I research/build_plan.py)."""
import csv
import json
import re
import unicodedata
from collections import defaultdict

ROOT = "/opt/plantas-es/research/"
matrix = json.load(open(ROOT + "plants_matrix_es.json"))
clusters = json.load(open(ROOT + "plants_clusters_es.json"))

CARE = {"cuidados", "riego", "luz", "plantar", "toxica", "flor"}  # merged into the plant page
SUB = {"reproducir": "como-reproducir", "hojas-amarillas": "hojas-amarillas", "poda": "poda", "tipos": "tipos"}  # own page if >= 1000
ROW = {"significado"}  # FAQ row only
# "beneficios" is skipped: for herbs it is medicinal/health intent (YMYL), not plant care.
# "base" (bare plant name) is skipped: mixes food, names, photos and shops.


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(ch for ch in s if unicodedata.category(ch) != "Mn").strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", norm(s)).strip("-")


pages = {}


def add(key, wave, topic, fmt, url, query, v, gate=""):
    p = pages.setdefault(key, {"wave": wave, "topic": topic, "format": fmt, "url": url, "query": query, "best": 0, "volume": 0, "variants": 0, "gate": gate})
    p["volume"] += v
    p["variants"] += 1
    if v > p["best"]:
        p["best"], p["query"] = v, query


# 1. Plant pages
by = defaultdict(lambda: defaultdict(list))
for x in matrix:
    by[x["id"]][x["intent"]].append(x)
care_rank = sorted(by, key=lambda pid: -sum(x["v"] for i in CARE for x in by[pid][i]))
for rank, pid in enumerate(care_rank):
    wave = 1 if rank < 40 else 2
    for i in CARE:
        for x in by[pid][i]:
            add(("plant", pid), wave, "ficha-planta", "page", f"/plantas/{pid}/", x["k"], x["v"], "datos de cultivo verificados; toxicidad por ASPCA")
    for i, sub in SUB.items():
        rows = by[pid][i]
        total = sum(x["v"] for x in rows)
        for x in rows:
            if total >= 1000:
                add(("plant", pid, i), 2, f"planta-{i}", "page", f"/plantas/{pid}/{sub}/", x["k"], x["v"])
            else:
                add(("row", pid, i), 2, f"planta-{i}", "faq-or-table", f"/plantas/{pid}/#{sub}", x["k"], x["v"])
    for i in ROW:
        for x in by[pid][i]:
            add(("row", pid, i), 2, "planta-significado", "faq-or-table", f"/plantas/{pid}/#significado", x["k"], x["v"], "sin promesas; tradicion popular")

# 2. Generic clusters: one page per intent group >= 500, smaller rows go to the hub FAQ.
STOP = set("como el la los las de del para que se en con por un una mi mis su sus y o a al es son hacer tiene tienen sirve eliminar quitar sacar combatir acabar matar exterminar deshacerse remedio remedios evitar 100 24 horas hora rapido rapida naturalmente natural naturales definitivamente facil facilmente casa porque por que hay".split())
NOISE = re.compile(r"adaptog|venenos|alucin|comestib|\buñas?\b|\bpies?\b|\bpiel\b|precio|mercadolibre|amazon|leroy|bauhaus|home depot|sodimac|homecenter|bricomart|cerca de mi|medicinal|venta|compra")
HUB = {"plagas": ("/plagas/", 1), "abono": ("/abonos/", 1), "listas": ("/listas/", 1), "problemas": ("/problemas/", 1), "sustrato": ("/sustratos-y-macetas/", 1), "huerto": ("/huerto/", 3)}
GATE = {"plagas": "solo remedios de bajo riesgo; productos con etiqueta; sin mezclas caseras toxicas", "listas": "toxicidad por ASPCA", "huerto": "calendario por hemisferio (AR/CL al reves)"}
GENERIC = {"planta", "plantas", "en", "casero", "casera", "caseros", "caseras", "hogar", "casa", "mejor", "mejores", "lo", "q"}


def stem(w):
    if w.endswith("s") and len(w) > 3:
        w = w[:-1]
    if w.endswith("e") and len(w) > 4:
        w = w[:-1]
    return w


for name, rows in clusters.items():
    base, wave = HUB[name]
    groups = defaultdict(list)
    for x in rows:
        n = norm(x["k"])
        if NOISE.search(n):
            continue
        key = frozenset(stem(w) for w in re.findall(r"[a-zñ0-9]+", n) if w not in STOP and w not in GENERIC)
        if key:
            groups[key].append(x)
    # Merge a group into a bigger one when one word set contains the other and differs by one word.
    order = sorted(groups, key=lambda k: -sum(x["v"] for x in groups[k]))
    parent = {}
    heads = []
    for k in order:
        target = next((h for h in heads if (k <= h or h <= k) and len(k ^ h) <= 1), None)
        if target is None:
            heads.append(k)
            parent[k] = k
        else:
            parent[k] = target
    merged = defaultdict(list)
    for k in order:
        merged[parent[k]].extend(groups[k])
    for key, rs in merged.items():
        total = sum(x["v"] for x in rs)
        best = max(rs, key=lambda x: x["v"])
        if total >= 500:
            for x in rs:
                add(("cluster", name, key), wave, name, "page", f"{base}{slug(best['k'])}/", x["k"], x["v"], GATE.get(name, ""))
        elif total >= 50:
            for x in rs:
                add(("crow", name, key), wave, name, "faq-or-table", f"{base}#{slug(best['k'])}", x["k"], x["v"], GATE.get(name, ""))

# 3. Tools (low explicit demand; built because they answer the intent and feed a future app)
for url, q in [("/herramientas/identificar-planta/", "identificar planta por foto"), ("/herramientas/calendario-de-siembra/", "calendario de siembra"), ("/herramientas/que-planta-me-conviene/", "que planta de interior me conviene"), ("/herramientas/plantas-seguras-para-gatos-y-perros/", "plantas toxicas para gatos")]:
    add(("tool", url), 1, "herramienta", "page", url, q, 0, "sin volumen propio; ver demanda de la consulta")

rows = sorted(pages.values(), key=lambda p: (p["wave"], p["format"] != "page", -p["volume"]))
with open(ROOT + "content_plan.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["wave", "topic", "format", "url", "query", "best", "volume", "variants", "gate"])
    w.writeheader()
    w.writerows(rows)
summary = defaultdict(lambda: [0, 0, 0])
for p in rows:
    s = summary[(p["wave"], p["topic"])]
    s[0 if p["format"] == "page" else 1] += 1
    s[2] += p["volume"]
for (wave, topic), (pg, rw, v) in sorted(summary.items()):
    print(f"wave {wave} {topic:22} pages {pg:4} rows {rw:4} volume {v}")
print("TOTAL pages", sum(1 for p in rows if p["format"] == "page"), "rows", sum(1 for p in rows if p["format"] != "page"))
print("top plants:", ", ".join(care_rank[:40]))
