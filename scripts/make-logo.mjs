// Vetoriza a logo da Rutte (assets/rutte-original.png) em src/assets/rutte.svg (cor via currentColor).
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFileSync, mkdirSync } from 'node:fs';

const SCALE = 4;
const src = sharp('assets/rutte-original.png');
const { width, height } = await src.metadata();
// Canal verde separa bem o traço vermelho (G baixo) do fundo pêssego (G alto)
const buf = await src
  .extractChannel('green')
  .resize(width * SCALE, height * SCALE, { kernel: 'lanczos3' })
  .blur(0.8)
  .png()
  .toBuffer();

const svg = await new Promise((res, rej) =>
  potrace.trace(buf, { threshold: 120, turdSize: 20, optTolerance: 0.3, color: 'currentColor', background: 'transparent' }, (e, s) => (e ? rej(e) : res(s))),
);
const d = svg.match(/ d="([^"]+)"/)[1];
const W = width * SCALE, H = height * SCALE;
mkdirSync('src/assets', { recursive: true });
writeFileSync(
  'src/assets/rutte-path.ts',
  `// Gerado por scripts/make-logo.mjs — não editar à mão.\nexport const RUTTE_VIEWBOX = '0 0 ${W} ${H}';\nexport const RUTTE_PATH = '${d}';\n`,
);
// Favicon: arte vermelha sobre círculo branco
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.42}" ry="${H * 0.49}" fill="#FFFFFF"/><path fill="#B91B1C" fill-rule="evenodd" d="${d}"/></svg>`,
);
console.log('ok', W, H, d.length);

// Logo em PNG (alta resolução) — usada na interface. Traço vermelho da marca sobre oval branco.
const svgFull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.42}" ry="${H * 0.49}" fill="#FFFFFF"/><path fill="#B91B1C" fill-rule="evenodd" d="${d}"/></svg>`;
await sharp(Buffer.from(svgFull)).resize({ height: 1024 }).png({ compressionLevel: 9 }).toFile('public/rutte-logo.png');
await sharp('public/rutte-logo.png').toFile('src/assets/rutte-logo.png');
// apple-touch-icon (fundo navy) é gerado por scripts/make-mobile.mjs
console.log('png ok');
