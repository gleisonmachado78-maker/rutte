/**
 * Arquivos pessoais da pessoa (PDFs dos livros dela), guardados só no navegador via IndexedDB.
 * Nunca vão para o código, o repositório, o backup JSON ou o pacote do app.
 */

export interface LocalPdfInfo {
  key: string;
  name: string;
  size: number;
  addedAt: string;
}

interface LocalPdf extends LocalPdfInfo {
  blob: Blob;
}

const DB_NAME = 'rutte-files';
const STORE = 'pdfs';

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

export const localFiles = {
  async list(): Promise<Record<string, LocalPdfInfo>> {
    const all = await tx<LocalPdf[]>('readonly', (s) => s.getAll() as IDBRequest<LocalPdf[]>);
    return Object.fromEntries(all.map(({ blob: _blob, ...info }) => [info.key, info]));
  },
  async save(key: string, file: File): Promise<void> {
    const item: LocalPdf = { key, name: file.name, size: file.size, addedAt: new Date().toISOString(), blob: file };
    await tx('readwrite', (s) => s.put(item));
  },
  async get(key: string): Promise<LocalPdf | undefined> {
    return tx<LocalPdf | undefined>('readonly', (s) => s.get(key) as IDBRequest<LocalPdf | undefined>);
  },
  async remove(key: string): Promise<void> {
    await tx('readwrite', (s) => s.delete(key));
  },
};

export const formatSize = (bytes: number) => (bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
