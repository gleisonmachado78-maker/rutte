import type { BodyEntry } from '@/types';

/** IMC = peso (kg) / altura (m)². */
export function bmi(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export interface BmiCategory {
  label: string;
  /** classe de cor do texto/fundo (sempre acompanhada do rótulo) */
  tone: 'info' | 'ok' | 'warn' | 'alert';
}

/** Faixas da OMS para adultos. */
export function bmiCategory(v: number): BmiCategory {
  if (v < 18.5) return { label: 'Abaixo do peso', tone: 'info' };
  if (v < 25) return { label: 'Peso normal', tone: 'ok' };
  if (v < 30) return { label: 'Sobrepeso', tone: 'warn' };
  return { label: 'Obesidade', tone: 'alert' };
}

export const TONE_CLASS: Record<BmiCategory['tone'], string> = {
  info: 'bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-300',
  ok: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300',
  alert: 'bg-brand/10 text-brand dark:bg-brand/25 dark:text-red-200',
};

/** Faixa de peso "normal" (IMC 18,5–24,9) para a altura. */
export function healthyRange(heightCm: number) {
  const m2 = (heightCm / 100) ** 2;
  return { min: 18.5 * m2, max: 24.9 * m2 };
}

export const fmt1 = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** Converte texto "72,5" → 72.5 (0 se inválido). */
export const parseNum = (s: string) => {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const sortedLog = (log: BodyEntry[] = []) => [...log].sort((a, b) => a.date.localeCompare(b.date));

/** Metas diárias personalizadas pelo peso. */
export const proteinRange = (kg: number) => ({ min: Math.round(kg * 1.6), max: Math.round(kg * 2) });
export const waterLiters = (kg: number) => Math.round(kg * 0.035 * 10) / 10;
