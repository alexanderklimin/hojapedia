// Structured-data helpers shared by pages. Framework-free and tested.

export const SITE = 'https://hojapedia.com';
export const LAUNCH_DATE = '2026-11-19';

export const absolute = (path) => new URL(path, SITE).href;

export const publisher = () => ({
  '@type': 'Organization',
  name: 'Hojapedia',
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: absolute('/logo.png'), width: 512, height: 512 },
});

// Photo credits as schema.org ImageObject (Google image licence metadata + attribution for AI search).
export function imageObject(photo, src, width, height) {
  if (!photo || !src) return undefined;
  return {
    '@type': 'ImageObject',
    contentUrl: absolute(src),
    url: absolute(src),
    width,
    height,
    caption: photo.alt,
    creditText: `${photo.author} / Wikimedia Commons`,
    creator: { '@type': 'Person', name: photo.author },
    copyrightNotice: photo.author,
    license: photo.licenseUrl || photo.source,
    acquireLicensePage: photo.source,
  };
}

// Article JSON-LD for plant cards and guides.
export function article({ headline, description, url, reviewed, published = LAUNCH_DATE, image, about, citation }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    inLanguage: 'es',
    datePublished: published < reviewed ? published : reviewed,
    dateModified: reviewed,
    mainEntityOfPage: url,
    url,
    ...(image ? { image } : {}),
    ...(about ? { about } : {}),
    author: { '@type': 'Organization', name: 'Equipo de Hojapedia', url: absolute('/sobre-hojapedia/') },
    publisher: publisher(),
    ...(citation ? { citation } : {}),
  };
}
