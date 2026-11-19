import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Real last-modified dates for the sitemap: each card/guide uses its own "reviewed" date,
// other pages a fixed date, so a redeploy does not mark every URL as changed.
const SITE_UPDATED = '2026-11-19';
const reviewed = {};
for (const [dir, prefixes] of [['src/data/plants', ['/plantas/']], ['src/data/guides', ['/plagas/', '/sustratos-y-macetas/', '/abonos/']]]) {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf8'));
    for (const prefix of prefixes) reviewed[`${prefix}${file.replace('.json', '')}/`] = data.reviewed;
  }
}

export default defineConfig({
  site: 'https://hojapedia.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    serialize(item) {
      const path = new URL(item.url).pathname;
      return { ...item, lastmod: reviewed[path] ?? SITE_UPDATED };
    },
  })],
  build: { inlineStylesheets: 'always' },
});
