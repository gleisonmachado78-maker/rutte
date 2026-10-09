// Liga/desliga o modo atualização da Rutte (pato dançando, app em pausa, com previsão de término).
// Uso: node scripts/manutencao.mjs on [minutos previstos] [mensagem]   |   node scripts/manutencao.mjs off
// Depois: commit + push (a Vercel publica em ~1 min). Por segurança o modo expira sozinho 20 min após a previsão.
import { writeFileSync } from 'node:fs';

const [mode = 'off', min = '10', ...msg] = process.argv.slice(2);
const on = mode === 'on';
const now = Date.now();
const eta = now + Number(min) * 60_000;
const status = on
  ? {
      maintenance: true,
      start: new Date(now).toISOString(),
      eta: new Date(eta).toISOString(),
      until: new Date(eta + 20 * 60_000).toISOString(),
      message: msg.join(' ') || 'A Rutte está em atualização',
    }
  : { maintenance: false };
writeFileSync(new URL('../public/status.json', import.meta.url), `${JSON.stringify(status, null, 2)}\n`);
console.log(on ? `Modo atualização LIGADO · previsão ${new Date(eta).toLocaleTimeString('pt-BR')}` : 'Modo atualização DESLIGADO');
