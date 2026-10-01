import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Paperclip, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { askConfirm } from '@/components/ui/confirm';
import { formatSize, localFiles } from '@/lib/local-files';

const KEY = ['local-pdfs'] as const;

export const useLocalPdfs = () => useQuery({ queryKey: KEY, queryFn: localFiles.list, staleTime: Infinity });

/** Anexar / abrir / remover o PDF pessoal de um livro (fica só neste navegador). */
export function MyPdf({ bookKey, title }: { bookKey: string; title: string }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const { data: files = {} } = useLocalPdfs();
  const mine = files[bookKey];

  const save = useMutation({
    mutationFn: (file: File) => localFiles.save(bookKey, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('PDF anexado', { description: 'Guardado só neste navegador.' });
    },
    onError: () => toast.error('Não foi possível guardar o arquivo', { description: 'Talvez falte espaço no navegador.' }),
  });
  const remove = useMutation({
    mutationFn: () => localFiles.remove(bookKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const openPdf = async () => {
    const item = await localFiles.get(bookKey);
    if (!item) return;
    const url = URL.createObjectURL(item.blob);
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const onPick = (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Escolha um arquivo PDF');
      return;
    }
    save.mutate(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? undefined)} />
      {mine ? (
        <>
          <button type="button" onClick={openPdf} className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline dark:text-emerald-300" title={mine.name}>
            <FileText className="size-3.5" aria-hidden /> Abrir meu PDF <span className="font-normal text-foreground/50">({formatSize(mine.size)})</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              if (await askConfirm({ title: 'Remover o PDF?', message: `O arquivo de “${title}” será apagado deste navegador.`, confirmLabel: 'Remover', danger: true })) remove.mutate();
            }}
            className="inline-flex items-center gap-1 text-foreground/50 hover:text-red-600"
            aria-label={`Remover meu PDF de ${title}`}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </>
      ) : (
        <button type="button" onClick={() => input.current?.click()} disabled={save.isPending} className="inline-flex items-center gap-1 font-semibold text-foreground/70 hover:text-primary">
          <Paperclip className="size-3.5" aria-hidden /> {save.isPending ? 'Guardando…' : 'Anexar meu PDF'}
        </button>
      )}
    </div>
  );
}
