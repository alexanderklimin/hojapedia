// Photo credits for images from Wikimedia Commons. Only free licenses that allow reuse
// with attribution (CC BY / CC BY-SA) or without (CC0, public domain); no NC/ND.

export const ALLOWED_LICENSE = /^(CC0( 1\.0)?|Public domain|PD.*|CC BY(-SA)? [1-4]\.0( [a-z]{2,})?|CC BY(-SA)? 2\.5( [a-z]{2,})?)$/i;

export function validatePhoto(slug, photo) {
  const errors = [];
  for (const field of ['file', 'author', 'license', 'source', 'title']) if (!photo?.[field]) errors.push(`${slug}: falta ${field}`);
  if (photo?.license && !ALLOWED_LICENSE.test(photo.license)) errors.push(`${slug}: licencia no permitida (${photo.license})`);
  if (photo?.license && /^CC BY/i.test(photo.license) && !photo.licenseUrl) errors.push(`${slug}: falta licenseUrl`);
  if (photo?.source && !photo.source.startsWith('https://commons.wikimedia.org/')) errors.push(`${slug}: la fuente debe ser Wikimedia Commons`);
  if (photo?.alt !== undefined && photo.alt.length < 10) errors.push(`${slug}: alt demasiado corto`);
  return errors;
}

// "Foto: Autor · CC BY-SA 4.0 · Wikimedia Commons"
export function creditParts(photo) {
  return { author: photo.author, license: photo.license, licenseUrl: photo.licenseUrl || null, source: photo.source };
}
