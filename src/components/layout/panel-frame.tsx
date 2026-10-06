import { createContext, useContext, type HTMLAttributes, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/**
 * Moldura dos painéis de configuração: o mesmo conteúdo aparece como janela (Dialog, no menu) ou
 * direto na página (aba Configurações). Use PTitle/PDesc no lugar de DialogTitle/DialogDescription.
 */
export type PanelProps = { open?: boolean; onOpenChange?: (o: boolean) => void; inline?: boolean };

const InlineCtx = createContext(false);
export const useInlinePanel = () => useContext(InlineCtx);

export function PanelFrame({ inline, open, onOpenChange, className, children }: { inline?: boolean; open?: boolean; onOpenChange?: (o: boolean) => void; className?: string; children: ReactNode }) {
  if (inline)
    return (
      <InlineCtx.Provider value>
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">{children}</section>
      </InlineCtx.Provider>
    );
  return (
    <Dialog open={!!open} onOpenChange={(o) => onOpenChange?.(o)}>
      <DialogContent className={cn('max-h-[90dvh] max-w-lg overflow-y-auto', className)}>{children}</DialogContent>
    </Dialog>
  );
}

export function PTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return useInlinePanel() ? <h2 className={className} {...props} /> : <DialogTitle className={className} {...props} />;
}

export function PDesc({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return useInlinePanel() ? <p className={className} {...props} /> : <DialogDescription className={className} {...props} />;
}
