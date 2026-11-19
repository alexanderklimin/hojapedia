import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One JSON file per plant in src/data/plants/. The build fails if a card misses
// any field that CLAUDE.md requires (light, water, temperature, toxicity,
// propagation, problems), so unverified cards cannot ship.

const source = z.object({ name: z.string().min(3), url: z.url() });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const petStatus = z.enum(['toxica', 'no-toxica']);
// Group pages (succulents, cacti, bonsai…): toxicity depends on the species.
const groupStatus = z.enum(['toxica', 'no-toxica', 'variable']);

const plants = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/plants' }),
  schema: z.object({
    name: z.string(),
    synonyms: z.array(z.string()).default([]),
    scientific: z.string(),
    family: z.string(),
    origin: z.string(),
    title: z.string().max(65),
    description: z.string().min(70).max(160),
    summary: z.string().min(80),
    difficulty: z.enum(['fácil', 'media', 'exigente']),
    reviewed: isoDate,
    // Structured traits for the plant finder and lists; must follow the sourced care text.
    // sol = tolera varias horas de sol directo; semisombra = luz brillante indirecta o sombra ligera;
    // sombra = tolera poca luz o sombra profunda.
    traits: z.object({
      light: z.array(z.enum(['sol', 'semisombra', 'sombra'])).min(1),
      place: z.array(z.enum(['interior', 'exterior'])).min(1),
      group: z.enum(['flor', 'follaje', 'suculenta', 'aromatica']),
    }),
    care: z.object({
      light: z.object({ short: z.string(), text: z.string() }),
      water: z.object({ short: z.string(), text: z.string(), growing: z.string(), rest: z.string() }),
      // minC stays null when no source gives a minimum: never invent numbers.
      temperature: z.object({
        minC: z.number().nullable(),
        idealMinC: z.number().nullable(),
        idealMaxC: z.number().nullable(),
        short: z.string().optional(),
        text: z.string(),
      }).refine((t) => (t.idealMinC === null) === (t.idealMaxC === null) && (t.idealMinC !== null || t.short), 'Sin rango ideal hace falta short'),
      humidity: z.object({ short: z.string(), text: z.string() }),
      substrate: z.object({ short: z.string(), text: z.string(), pot: z.string() }),
      fertilizer: z.object({ short: z.string(), text: z.string() }),
    }),
    toxicity: z.object({
      cats: groupStatus,
      dogs: groupStatus,
      principles: z.string().optional(),
      signs: z.string().optional(),
      aspcaName: z.string(),
      aspcaUrl: z.url().startsWith('https://www.aspca.org/'),
      checked: isoDate,
      // Required when cats or dogs is 'variable': one ASPCA entry per common species.
      species: z.array(z.object({
        name: z.string(),
        scientific: z.string(),
        cats: petStatus,
        dogs: petStatus,
        aspcaName: z.string(),
        aspcaUrl: z.url().startsWith('https://www.aspca.org/'),
        plant: z.string().optional(),
      })).optional(),
    }).refine((t) => (t.cats !== 'variable' && t.dogs !== 'variable') || (t.species?.length ?? 0) >= 3, 'Grupo: faltan especies con su ficha ASPCA'),
    propagation: z.array(z.object({
      method: z.string(),
      when: z.string(),
      steps: z.array(z.string()).min(2),
    })).min(1),
    problems: z.array(z.object({
      symptom: z.string(),
      cause: z.string(),
      fix: z.string(),
    })).min(3),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(source).min(1),
  }),
});

// Guides: pests, growing media and fertilizers. Same evidence rules as plants.
// `keywords` link guides and plant cards both ways (see src/lib/related.js).
const guides = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/guides' }),
  schema: z.object({
    kind: z.enum(['plaga', 'sustrato', 'abono']),
    name: z.string(),
    synonyms: z.array(z.string()).default([]),
    title: z.string().max(65),
    description: z.string().min(70).max(160),
    summary: z.string().min(80),
    keywords: z.array(z.string().min(3)).min(1),
    reviewed: isoDate,
    sections: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      heading: z.string(),
      paragraphs: z.array(z.string()).default([]),
      list: z.array(z.string()).optional(),
      ordered: z.boolean().default(false),
    })).min(3),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(source).min(2),
  }),
});

export const collections = { plants, guides };
