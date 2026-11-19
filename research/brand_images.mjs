// Generates the logo (512x512) and the default social image (1200x630) from SVG. Own artwork, no third-party content.
import sharp from 'sharp';
const out = process.argv[2];
const leaf = '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#1f6b3a"/><g transform="translate(96 96) scale(13.3)">${leaf}</g></svg>`;
await sharp(Buffer.from(logo)).png().toFile(`${out}/logo.png`);
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f7f8f3"/>
<circle cx="1010" cy="140" r="210" fill="#e5f2e6"/><circle cx="1090" cy="520" r="150" fill="#fbe8ef"/><circle cx="880" cy="470" r="90" fill="#efeafa"/>
<rect x="90" y="110" width="110" height="110" rx="28" fill="#1f6b3a"/><g transform="translate(117 137) scale(2.3)">${leaf}</g>
<text x="225" y="192" font-family="Georgia, serif" font-size="76" font-weight="700" fill="#1c2a1f">Hoja<tspan fill="#1f6b3a">pedia</tspan></text>
<text x="90" y="330" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#1c2a1f">Cuida tus plantas sin adivinar</text>
<text x="90" y="410" font-family="Arial, sans-serif" font-size="32" fill="#5d6b61">Luz, riego, sustrato, plagas y toxicidad para mascotas</text>
<text x="90" y="460" font-family="Arial, sans-serif" font-size="32" fill="#5d6b61">con fuentes citadas · hemisferio norte y sur</text></svg>`;
await sharp(Buffer.from(og)).png().toFile(`${out}/og-default.png`);
console.log('ok');
