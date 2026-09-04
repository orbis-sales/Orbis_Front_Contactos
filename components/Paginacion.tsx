'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@orbis/ui';

/** Números de página con elipsis: siempre la primera, la última y las vecinas. */
function paginas(actual: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, actual, actual - 1, actual + 1]);
  const lista = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const salida: Array<number | '…'> = [];
  for (const [i, n] of lista.entries()) {
    const previa = lista[i - 1];
    if (previa !== undefined && n - previa > 1) salida.push('…');
    salida.push(n);
  }
  return salida;
}

export function Paginacion({ page, pages, total }: { page: number; pages: number; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const ir = (destino: number) => {
    const next = new URLSearchParams(params.toString());
    if (destino <= 1) next.delete('page');
    else next.set('page', String(destino));
    startTransition(() => router.push(`/?${next.toString()}`));
  };

  if (pages <= 1) {
    return <p className="text-[12.5px] text-subtle">{total} productos</p>;
  }

  return (
    <nav aria-label="Paginación" className={cn('flex items-center gap-3', pending && 'opacity-70')}>
      <p className="text-[12.5px] text-subtle">
        Página {page} de {pages} · {total} productos
      </p>

      <div className="ml-auto flex items-center gap-1">
        <Boton onClick={() => ir(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </Boton>

        {paginas(page, pages).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-[13px] text-subtle">
              …
            </span>
          ) : (
            <Boton key={n} onClick={() => ir(n)} activo={n === page} aria-current={n === page ? 'page' : undefined}>
              {n}
            </Boton>
          ),
        )}

        <Boton onClick={() => ir(page + 1)} disabled={page >= pages} aria-label="Página siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </Boton>
      </div>
    </nav>
  );
}

function Boton({
  children,
  onClick,
  disabled,
  activo,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  activo?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-7 min-w-7 place-items-center rounded-md border px-2 font-mono text-[12.5px] tabular-nums transition-colors duration-[120ms]',
        activo
          ? 'border-brand-border bg-brand-soft text-brand-ink'
          : 'border-border text-muted hover:bg-surface-2 hover:text-text',
        disabled && 'pointer-events-none opacity-40',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
