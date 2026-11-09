/**
 * Imagens das notas, guardadas só neste navegador (IndexedDB `rutte-note-images`).
 * Ficam fora do banco/sincronização para não estourar o espaço do localStorage; a nota guarda só a chave.
 * Toda imagem é reduzida (lado maior até 1600 px) e comprimida antes de salvar.
 */
import { uid } from './utils';

const DB_NAME = 'rutte-note-images';
const STORE = 'images';
const MAX_SIDE = 1600;

interface StoredImage {
  key: string;
  blob: Blob;
  w: number;
  h: number;
  addedAt: string;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'key' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

/** Lê o arquivo como imagem, reduz e comprime (WebP se der, senão JPEG). */
async function shrink(file: Blob): Promise<{ blob: Blob; w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não foi possível abrir a imagem'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    // GIF animado e imagens já pequenas ficam como estão
    if (file.type === 'image/gif' || (scale === 1 && file.size < 350_000)) return { blob: file, w, h };
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    if (!g) return { blob: file, w, h };
    g.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    const final = blob && blob.type === 'image/webp' ? blob : await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return { blob: final ?? file, w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const urls = new Map<string, string>();

export const noteImages = {
  /** Salva a imagem e devolve a chave e o tamanho final. */
  async add(file: Blob): Promise<{ key: string; w: number; h: number }> {
    const { blob, w, h } = await shrink(file);
    const key = uid('img');
    await tx('readwrite', (s) => s.put({ key, blob, w, h, addedAt: new Date().toISOString() } satisfies StoredImage));
    return { key, w, h };
  },
  /** URL para mostrar a imagem (ou null se ela não está neste aparelho). */
  async url(key: string): Promise<string | null> {
    const cached = urls.get(key);
    if (cached) return cached;
    const item = await tx<StoredImage | undefined>('readonly', (s) => s.get(key) as IDBRequest<StoredImage | undefined>).catch(() => undefined);
    if (!item) return null;
    const u = URL.createObjectURL(item.blob);
    urls.set(key, u);
    return u;
  },
  async keys(): Promise<string[]> {
    return (await tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String);
  },
  async remove(key: string) {
    const u = urls.get(key);
    if (u) URL.revokeObjectURL(u);
    urls.delete(key);
    await tx('readwrite', (s) => s.delete(key));
  },
  /** Apaga as imagens que nenhuma nota usa mais (chamado ao abrir as Notas). */
  async cleanup(used: Set<string>) {
    try {
      const all = await this.keys();
      await Promise.all(all.filter((k) => !used.has(k)).map((k) => this.remove(k)));
    } catch {
      /* sem IndexedDB: nada a limpar */
    }
  },
};

/** Imagens que vieram num colar/arrastar. */
export const imageFiles = (list?: FileList | DataTransferItemList | null): File[] => {
  if (!list) return [];
  const out: File[] = [];
  for (const it of Array.from(list as ArrayLike<File | DataTransferItem>)) {
    const f = it instanceof File ? it : it.kind === 'file' ? it.getAsFile() : null;
    if (f && f.type.startsWith('image/')) out.push(f);
  }
  return out;
};
