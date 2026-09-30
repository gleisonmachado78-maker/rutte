import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

function Overlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay className={cn('fixed inset-0 z-40 bg-navy/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in', className)} />
  );
}

/** Slide-over lateral (direita para detalhes, esquerda para menu mobile). Tela cheia em telas pequenas. */
export function SheetContent({
  side = 'right',
  className,
  children,
  hideClose,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: 'left' | 'right';
  hideClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-full flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl outline-none',
          side === 'right'
            ? 'right-0 sm:max-w-xl data-[state=open]:animate-slide-in-right sm:border-l sm:border-border'
            : 'left-0 max-w-[85vw] sm:max-w-xs data-[state=open]:animate-slide-in-left',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))] grid size-10 place-items-center rounded-xl text-foreground/60 transition-all duration-200 hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <Overlay className="z-[60]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none data-[state=open]:animate-zoom-in',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
