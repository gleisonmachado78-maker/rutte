// Liga/desliga o modo atualização da Rutte (pato dançando, app em pausa).
// Uso: node scripts/manutencao.mjs on [minutos] [mensagem]   |   node scripts/manutencao.mjs off
// Depois: commit + push (a Vercel publica em ~1 min). O modo expira sozinho em "until" por segurança.
import { writeFileSync } from 'node:fs';

const [mode = 'off', min = '30', ...msg] = process.argv.slice(2);
const on = mode === 'on';
const status = on
  ? { maintenance: true, until: new Date(Date.now() + Number(min) * 60_000).toISOString(), message: msg.join(' ') || 'A Rutte está em atualização' }
  : { maintenance: false };
writeFileSync(new URL('../public/status.json', import.meta.url), `${JSON.stringify(status, null, 2)}\n`);
console.log(on ? `Modo atualização LIGADO até ${status.until}` : 'Modo atualização DESLIGADO');
