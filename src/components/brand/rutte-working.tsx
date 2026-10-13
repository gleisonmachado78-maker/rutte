import type { CSSProperties } from 'react';

const d = (v: string) => ({ '--d': v }) as CSSProperties;

const SKIN = '#F3C7A6';
const SKIN_SHADE = '#E2A985';
const HAIR = '#ECEAF3';
const HAIR_SHADE = '#CFCBDD';
const RED = '#B91B1C';
const INK = '#2B2340';

/**
 * A Rutte (senhora de cabelo grisalho e óculos redondos) trabalhando no computador — tela de atualização.
 * Ela digita, pisca, olha para o monitor; na tela as linhas são escritas, os itens conferidos e a engrenagem gira.
 */
export function RutteWorking({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 320" className={className} role="img" aria-label="A Rutte trabalhando no computador">
      <defs>
        <radialGradient id="rw-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0.22" />
          <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rw-screen-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141B33" />
          <stop offset="1" stopColor="#0B1020" />
        </linearGradient>
        <clipPath id="rw-screen">
          <rect x="282" y="86" width="168" height="112" rx="6" />
        </clipPath>
      </defs>

      {/* luz de fundo e sombra no chão */}
      <ellipse cx="240" cy="160" rx="230" ry="150" fill="url(#rw-glow)" />
      <ellipse cx="240" cy="306" rx="200" ry="9" fill="#000" opacity="0.25" />

      {/* brilhos */}
      <path className="rw-spark" style={d('0s')} d="M262 48l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="rgb(var(--neon))" />
      <path className="rw-spark" style={d('0.9s')} d="M462 58l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="rgb(var(--neon))" />
      <path className="rw-spark" style={d('1.7s')} d="M58 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="rgb(var(--neon))" />

      {/* vaso de planta */}
      <g className="rw-plant" style={{ transformOrigin: '52px 236px' }}>
        <path d="M52 236 C40 214 30 206 26 190 C40 196 50 210 52 236Z" fill="#2F9E6E" />
        <path d="M52 236 C58 210 70 200 80 188 C80 206 66 220 52 236Z" fill="#38B37C" />
        <path d="M52 236 C48 212 50 196 56 176 C62 196 58 214 52 236Z" fill="#268A5E" />
      </g>
      <path d="M36 234 h32 l-4 24 h-24z" fill="#C2410C" />
      <rect x="34" y="230" width="36" height="7" rx="3" fill="#D9561F" />

      {/* cadeira */}
      <rect x="94" y="150" width="112" height="112" rx="26" fill="#27304F" />
      <rect x="104" y="160" width="92" height="98" rx="20" fill="#2F3A5E" />

      {/* corpo: blusa vermelha com gola branca */}
      <path d="M84 262 C86 216 110 196 150 194 C190 196 214 216 216 262 Z" fill={RED} />
      <rect x="140" y="176" width="20" height="26" rx="8" fill={SKIN_SHADE} />
      <path d="M132 196 L150 214 L168 196 L160 194 L150 204 L140 194Z" fill="#fff" />
      <circle cx="150" cy="226" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="150" cy="240" r="2.6" fill="#fff" opacity="0.9" />

      {/* cabeça */}
      <g className="rw-head" style={{ transformOrigin: '150px 190px' }}>
        {/* cabelo de trás */}
        <g fill={HAIR_SHADE}>
          <circle cx="114" cy="140" r="15" />
          <circle cx="186" cy="140" r="15" />
          <circle cx="118" cy="160" r="11" />
          <circle cx="182" cy="160" r="11" />
        </g>
        {/* orelhas e brincos */}
        <ellipse cx="117" cy="147" rx="6" ry="8" fill={SKIN_SHADE} />
        <ellipse cx="183" cy="147" rx="6" ry="8" fill={SKIN_SHADE} />
        <circle cx="116" cy="158" r="3.2" fill={RED} />
        <circle cx="184" cy="158" r="3.2" fill={RED} />
        {/* rosto */}
        <ellipse cx="150" cy="144" rx="33" ry="38" fill={SKIN} />
        {/* cabelo de cima (cachos) */}
        <g fill={HAIR}>
          <circle cx="122" cy="116" r="16" />
          <circle cx="136" cy="102" r="17" />
          <circle cx="155" cy="98" r="18" />
          <circle cx="173" cy="105" r="16" />
          <circle cx="182" cy="121" r="14" />
          <circle cx="116" cy="130" r="11" />
          <circle cx="186" cy="134" r="10" />
        </g>
        <path d="M122 124 C132 112 150 110 160 116 C168 110 178 114 182 124 C172 118 162 122 156 126 C146 118 132 118 122 124Z" fill={HAIR_SHADE} />
        {/* sobrancelhas */}
        <path d="M128 128 q8 -5 16 -1" stroke="#A9A3BD" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M156 127 q8 -4 16 1" stroke="#A9A3BD" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {/* olhos (piscam e olham para o monitor) */}
        <g className="rw-look">
          <g className="rw-blink" style={{ transformOrigin: '150px 142px' }}>
            <ellipse cx="137" cy="142" rx="2.8" ry="3.4" fill={INK} />
            <ellipse cx="163" cy="142" rx="2.8" ry="3.4" fill={INK} />
          </g>
        </g>
        {/* óculos redondos */}
        <circle cx="136" cy="142" r="11.5" fill="#fff" fillOpacity="0.18" stroke={RED} strokeWidth="3" />
        <circle cx="164" cy="142" r="11.5" fill="#fff" fillOpacity="0.18" stroke={RED} strokeWidth="3" />
        <path d="M147.5 141 q2.5 -3 5 0" stroke={RED} strokeWidth="3" fill="none" />
        <path d="M124.5 140 l-6 -2" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M175.5 140 l6 -2" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
        {/* nariz, bochechas, sorriso e ruguinhas */}
        <path d="M150 147 q-4 9 1 10" stroke={SKIN_SHADE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="128" cy="160" r="6" fill="#F28B8B" opacity="0.4" />
        <circle cx="172" cy="160" r="6" fill="#F28B8B" opacity="0.4" />
        <path d="M139 165 q11 10 22 0" fill="#8E1E2A" />
        <path d="M141.5 165.6 q8.5 4 17 0" fill="#fff" />
        <path d="M121 150 l-4 2 M179 150 l4 2" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* mesa */}
      <rect x="20" y="258" width="440" height="14" rx="7" fill="#323C5E" />
      <rect x="20" y="258" width="440" height="4" rx="2" fill="#3E4A70" />
      <rect x="44" y="272" width="10" height="34" rx="3" fill="#2A3350" />
      <rect x="426" y="272" width="10" height="34" rx="3" fill="#2A3350" />

      {/* teclado */}
      <rect x="96" y="242" width="112" height="16" rx="4" fill="#46507A" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={102 + i * 11.4} y="246" width="8" height="3.5" rx="1" fill="#6B77A3" />
      ))}
      <rect x="114" y="251.5" width="76" height="3.5" rx="1" fill="#6B77A3" />

      {/* braços (mangas) e mãos digitando */}
      <path d="M100 214 C92 232 104 242 122 244" fill="none" stroke={RED} strokeWidth="15" strokeLinecap="round" />
      <path d="M200 214 C208 232 196 242 178 244" fill="none" stroke={RED} strokeWidth="15" strokeLinecap="round" />
      <ellipse className="rw-hand" cx="128" cy="244" rx="10" ry="6.5" fill={SKIN} />
      <ellipse className="rw-hand rw-hand-2" cx="172" cy="244" rx="10" ry="6.5" fill={SKIN} />

      {/* caneca com vapor */}
      <path d="M232 236 h22 v16 a6 6 0 0 1 -6 6 h-10 a6 6 0 0 1 -6 -6 z" fill="#fff" />
      <path d="M254 241 a5 5 0 0 1 0 10" fill="none" stroke="#fff" strokeWidth="3" />
      <rect x="236" y="244" width="14" height="5" rx="2" fill={RED} />
      <path className="rw-steam" d="M240 230 c-4 -6 4 -9 0 -15" fill="none" stroke="rgb(255 255 255 / .55)" strokeWidth="2.5" strokeLinecap="round" />
      <path className="rw-steam" style={d('0.8s')} d="M247 230 c-4 -6 4 -9 0 -15" fill="none" stroke="rgb(255 255 255 / .55)" strokeWidth="2.5" strokeLinecap="round" />

      {/* monitor */}
      <rect x="352" y="206" width="28" height="40" fill="#3A4466" />
      <rect x="330" y="244" width="72" height="12" rx="4" fill="#46507A" />
      <rect x="274" y="78" width="184" height="128" rx="12" fill="#46507A" />
      <rect x="282" y="86" width="168" height="112" rx="6" fill="url(#rw-screen-bg)" />
      <g clipPath="url(#rw-screen)">
        <rect x="282" y="86" width="168" height="14" fill="#1B2340" />
        <circle cx="291" cy="93" r="2.5" fill={RED} />
        <circle cx="299" cy="93" r="2.5" fill="#D97706" />
        <circle cx="307" cy="93" r="2.5" fill="#059669" />
        {(
          [
            [292, 112, 70, RED],
            [300, 122, 92, '#5A6690'],
            [300, 132, 58, 'rgb(var(--neon))'],
            [292, 142, 82, '#5A6690'],
            [300, 152, 46, '#5A6690'],
          ] as const
        ).map(([x, y, w, c], i) => (
          <rect key={i} className="rw-line" style={{ ...d(`${i * 0.55}s`), transformOrigin: `${x}px ${y}px` }} x={x} y={y - 3} width={w} height="5" rx="2.5" fill={c} />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} className="rw-check" style={{ ...d(`${1 + i * 0.7}s`), transformOrigin: `408px ${116 + i * 16}px` }}>
            <circle cx="408" cy={116 + i * 16} r="6" fill="#059669" />
            <path d={`M405 ${116 + i * 16} l2.2 2.3 l4 -4.4`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        <g className="rw-gear" style={{ transformOrigin: '428px 178px' }}>
          <circle cx="428" cy="178" r="9" fill="none" stroke="#6B77A3" strokeWidth="5" strokeDasharray="4 3.1" />
          <circle cx="428" cy="178" r="3" fill="#6B77A3" />
        </g>
        <rect x="292" y="176" width="112" height="6" rx="3" fill="#1B2340" />
        <rect className="rw-progress" style={{ transformOrigin: '292px 179px' }} x="292" y="176" width="112" height="6" rx="3" fill="rgb(var(--neon))" />
        <rect className="rw-cursor" x="350" y="149" width="3" height="7" fill="#fff" />
      </g>
    </svg>
  );
}
