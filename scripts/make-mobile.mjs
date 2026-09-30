// Monta o pacote "celular/": HTML único + ícones + manifesto + service worker.
// - celular/rutte-celular.html → abrir direto no aparelho
// - pasta celular/ inteira → hospedar (Netlify Drop / GitHub Pages) e instalar na tela inicial
import sharp from 'sharp';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';

const out = 'celular';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const NAVY = { r: 17, g: 23, b: 39, alpha: 1 };
async function icon(size, file, scale) {
  const logo = await sharp('src/assets/rutte-logo.png').resize({ height: Math.round(size * scale) }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${out}/${file}`);
}
await icon(192, 'icon-192.png', 0.86);
await icon(512, 'icon-512.png', 0.86);
await icon(512, 'icon-maskable-512.png', 0.62); // área segura do ícone adaptável
await icon(180, 'apple-touch-icon.png', 0.86);
await sharp(`${out}/icon-192.png`).toFile('public/icon-192.png');
await sharp(`${out}/icon-512.png`).toFile('public/icon-512.png');
await sharp(`${out}/icon-maskable-512.png`).toFile('public/icon-maskable-512.png');
await sharp(`${out}/apple-touch-icon.png`).toFile('public/apple-touch-icon.png');

copyFileSync('dist-single/index.html', `${out}/index.html`);
copyFileSync('dist-single/index.html', `${out}/rutte-celular.html`);
copyFileSync('public/manifest.webmanifest', `${out}/manifest.webmanifest`);
copyFileSync('public/sw.js', `${out}/sw.js`);
console.log('Pacote para celular pronto em ./celular');
