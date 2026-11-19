// Social/Article image for a page: the page's Commons photo resized to 1200px JPEG, or the default card.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import photos from '../data/photos.json';
import { imageObject } from './seo.js';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.{jpg,jpeg}', { eager: true });

export async function pageImage(slug: string) {
  const photo = (photos as Record<string, any>)[slug];
  const meta = photo ? files[`../assets/photos/${photo.file}`]?.default : undefined;
  if (!photo || !meta) return { og: { src: '/og-default.png', alt: 'Hojapedia', width: 1200, height: 630 }, schema: undefined };
  const img = await getImage({ src: meta, width: 1200, format: 'jpeg', quality: 78 });
  const width = 1200;
  const height = Math.round((meta.height / meta.width) * width);
  return { og: { src: img.src, alt: photo.alt, width, height }, schema: imageObject(photo, img.src, width, height) };
}
