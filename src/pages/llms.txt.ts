// /llms.txt: a short, plain-text map of the site for AI assistants (llmstxt.org format).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GUIDE_SECTIONS, guidePath } from '../lib/related.js';
import { listsToPublish } from '../lib/finder.js';

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const plants = (await getCollection('plants')).sort((a, b) => a.data.name.localeCompare(b.data.name, 'es'));
  const guides = (await getCollection('guides')).sort((a, b) => a.data.name.localeCompare(b.data.name, 'es'));
  const lists = listsToPublish(plants);
  const lines = [
    '# Hojapedia',
    '',
    '> Fichas de cuidado de plantas de interior y jardín en español: luz, riego, temperatura, sustrato, reproducción, problemas frecuentes y toxicidad para gatos y perros según la ASPCA. Cada ficha cita sus fuentes (servicios de extensión universitaria, RHS) e indica las épocas para el hemisferio norte y sur.',
    '',
    `Metodología y fuentes: ${abs('/sobre-hojapedia/')}`,
    '',
    '## Fichas de plantas',
    ...plants.map((p) => `- [${p.data.name}](${abs(`/plantas/${p.id}/`)}): ${p.data.description}`),
    '',
    '## Guías',
    ...guides.map((g) => `- [${g.data.name}](${abs(guidePath(g.data.kind, g.id))}) (${GUIDE_SECTIONS[g.data.kind].label}): ${g.data.description}`),
    '',
    '## Listas y herramientas',
    `- [Plantas tóxicas y seguras para gatos y perros](${abs('/listas/plantas-toxicas-para-gatos-y-perros/')})`,
    ...lists.map((l) => `- [${l.h1}](${abs(`/listas/${l.slug}/`)})`),
    `- [Buscador de plantas por luz, lugar y mascotas](${abs('/herramientas/buscador-de-plantas/')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
