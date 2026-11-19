import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One JSON file per plant in src/data/plants/. The build fails if a card misses
// any field that CLAUDE.md requires (light, water, temperature, toxicity,
// propagation, problems), so unverified cards cannot ship.

const source = z.object({ name: z.string().min(3), url: z.url() });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const petStatus = z.enum(['toxica', 'no-toxica']);

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
      cats: petStatus,
      dogs: petStatus,
      principles: z.string().optional(),
      signs: z.string().optional(),
      aspcaName: z.string(),
      aspcaUrl: z.url().startsWith('https://www.aspca.org/'),
      checked: isoDate,
    }),
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

export const collections = { plants };
