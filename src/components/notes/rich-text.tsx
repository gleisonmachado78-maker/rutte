import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Pilcrow, Strikethrough, Underline } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Texto com formatação das notas (negrito, itálico, sublinhado, riscado, título, subtítulo e listas).
 * Editor contentEditable; o HTML guardado passa sempre por `cleanNoteHtml` (só as marcas permitidas).
 */

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BR', 'DIV', 'P', 'H2', 'H3', 'UL', 'OL', 'LI', 'SPAN']);
const RENAME: Record<string, string> = { STRONG: 'b', EM: 'i', STRIKE: 's', P: 'div' };

/** Mantém só as marcas de formatação permitidas (sem atributos, estilos ou scripts). */
export function cleanNoteHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const out = document.createElement('div');
  const walk = (from: Node, to: Node) => {
    from.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        to.appendChild(document.createTextNode(n.textContent ?? ''));
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const tag = (n as Element).tagName;
        if (ALLOWED.has(tag)) {
          const el = document.createElement((RENAME[tag] ?? tag).toLowerCase());
          // span só serve de envoltório: fica o conteúdo
          if (tag === 'SPAN') walk(n, to);
          else {
            walk(n, el);
            to.appendChild(el);
          }
        } else if (!['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(tag)) walk(n, to);
      }
    });
  };
  walk(doc.body.firstChild ?? doc.body, out);
  return out.innerHTML;
}

/** Texto simples a partir do HTML (busca, prévia e "virar afazer"). */
export function noteHtmlToText(html: string): string {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html.replace(/<\/(div|h2|h3|li)>/gi, '</$1>\n').replace(/<br\s*\/?>/gi, '\n');
  return (el.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

/** Texto antigo (sem formatação) vira HTML preservando as quebras de linha. */
export const textToNoteHtml = (text: string) =>
  text
    .split('\n')
    .map((l) => `<div>${l ? l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '<br>'}</div>`)
    .join('');

/** Classes do texto formatado (editor e prévia). */
export const RICH = 'rich-note [&_b]:font-bold [&_h2]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-1.5 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_s]:opacity-60';

export function RichText({
  html,
  onChange,
  placeholder,
  className,
  style,
  autoFocus,
  ariaLabel,
}: {
  html: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string>('');

  // conteúdo vindo de fora (abrir a nota, desfazer, outro aparelho) sem atropelar quem está digitando
  useEffect(() => {
    const el = ref.current;
    if (!el || html === last.current) return;
    if (document.activeElement === el) return;
    el.innerHTML = cleanNoteHtml(html);
    last.current = html;
  }, [html]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const raw = el.innerHTML === '<br>' ? '' : el.innerHTML;
    last.current = raw;
    onChange(raw, noteHtmlToText(raw));
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      data-autofocus={autoFocus ? '' : undefined}
      onFocus={(e) => {
        // foco vindo de fora (abrir a nota): cursor no fim do texto
        const el = e.currentTarget;
        const sel = window.getSelection();
        if (sel && !el.contains(sel.anchorNode)) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }}
      onInput={emit}
      onBlur={emit}
      onPaste={(e) => {
        // imagens seguem para a nota (o cartão cuida); texto colado entra sem formatação estranha
        if (Array.from(e.clipboardData.items).some((i) => i.kind === 'file')) return;
        const text = e.clipboardData.getData('text/plain');
        if (!text) return;
        e.preventDefault();
        document.execCommand('insertText', false, text);
      }}
      style={style}
      className={cn(
        RICH,
        'min-w-0 whitespace-pre-wrap break-words outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
        'empty:before:pointer-events-none empty:before:text-foreground/35 empty:before:content-[attr(data-placeholder)]',
        className,
      )}
    />
  );
}

/** Barra de formatação (age sobre o texto selecionado do editor que estiver com o cursor). */
export function RichToolbar({ className }: { className?: string }) {
  const run = (cmd: string, value?: string) => {
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(cmd, false, value);
  };
  const btn = (label: string, Icon: typeof Bold, onClick: () => void) => (
    <button
      key={label}
      type="button"
      // não tira o cursor do texto ao clicar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
  return (
    <div role="toolbar" aria-label="Formatação do texto" className={cn('flex flex-wrap items-center gap-0.5', className)}>
      {btn('Negrito (Ctrl+B)', Bold, () => run('bold'))}
      {btn('Itálico (Ctrl+I)', Italic, () => run('italic'))}
      {btn('Sublinhado (Ctrl+U)', Underline, () => run('underline'))}
      {btn('Riscado', Strikethrough, () => run('strikeThrough'))}
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      {btn('Título', Heading2, () => run('formatBlock', 'H2'))}
      {btn('Subtítulo', Heading3, () => run('formatBlock', 'H3'))}
      {btn('Texto normal', Pilcrow, () => run('formatBlock', 'DIV'))}
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      {btn('Lista com marcadores', List, () => run('insertUnorderedList'))}
      {btn('Lista numerada', ListOrdered, () => run('insertOrderedList'))}
    </div>
  );
}
