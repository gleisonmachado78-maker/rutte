import { format } from 'date-fns';
import { ClipboardCopy, Download, FileUp, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Textarea } from '@/components/ui/form-controls';
import { PanelFrame, PDesc, PTitle, type PanelProps } from './panel-frame';
import { useImportData } from '@/hooks/use-data';
import { api } from '@/services/api';

/**
 * Backup dos dados: como tudo fica salvo só no navegador de cada aparelho,
 * é assim que se leva os dados do computador para o celular (e vice-versa).
 */
export function BackupDialog({ open = true, onOpenChange = () => {}, inline }: PanelProps) {
  const importer = useImportData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState('');

  const download = async () => {
    const json = await api.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rutte-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast.success('Backup gerado', { description: 'Se o download não começar, use “Copiar backup”.' });
  };

  const copy = async () => {
    const json = await api.exportData();
    try {
      await navigator.clipboard.writeText(json);
      toast.success('Backup copiado', { description: 'Cole em uma nota, e-mail ou WhatsApp para levar ao outro aparelho.' });
    } catch {
      setPasted(json);
      toast('Não foi possível copiar automaticamente', { description: 'O backup apareceu no campo abaixo: selecione e copie.' });
    }
  };

  const restore = async (json: string) => {
    if (!json.trim()) return;
    const ok = await askConfirm({
      title: 'Restaurar este backup?',
      message: 'Os dados atuais deste aparelho serão substituídos pelos do backup.',
      confirmLabel: 'Restaurar',
      danger: true,
    });
    if (!ok) return;
    importer.mutate(json, { onSuccess: () => { setPasted(''); onOpenChange(false); } });
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => void restore(String(reader.result ?? ''));
    reader.readAsText(f);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <PanelFrame inline={inline} open={open} onOpenChange={onOpenChange}>
        <PTitle className="text-lg font-bold">Backup dos dados</PTitle>
        <PDesc className="mt-1 text-sm text-foreground/70">
          Seus dados ficam salvos só neste aparelho. Para levar para o celular (ou outro computador), exporte aqui e importe lá.
        </PDesc>

        <section className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold">1. Exportar deste aparelho</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download}>
              <Download /> Baixar arquivo
            </Button>
            <Button variant="outline" onClick={copy}>
              <ClipboardCopy /> Copiar backup
            </Button>
          </div>
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold">2. Importar no outro aparelho</h3>
          <input ref={fileRef} type="file" accept="application/json,.json,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importer.isPending}>
            <FileUp /> Escolher arquivo de backup
          </Button>
          <p className="text-xs text-foreground/60">Ou cole o texto do backup:</p>
          <Textarea
            id="backup-paste"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{"app":"rutte", ...}'
            aria-label="Texto do backup"
            className="min-h-[90px] font-mono text-xs"
          />
          <Button onClick={() => restore(pasted)} disabled={!pasted.trim() || importer.isPending} className="w-full">
            <Upload /> Restaurar backup colado
          </Button>
        </section>
      </PanelFrame>
  );
}
