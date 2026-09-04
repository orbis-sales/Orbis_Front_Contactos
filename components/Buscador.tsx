'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@orbis/ui';

export function Buscador({ valor, total }: { valor: string; total: number }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  const buscar = (texto: string) => {
    const q = new URLSearchParams();
    if (texto.trim()) q.set('search', texto.trim());
    startTransition(() => router.push(`/?${q}`));
  };

  return (
    <div className={cn('flex items-center gap-3', pendiente && 'opacity-70')}>
      <div className="flex h-[31px] w-[320px] items-center gap-2 rounded-[7px] border border-border-strong bg-bg px-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orbis-text-subtle)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.5" y2="16.5" />
        </svg>
        <input
          type="search"
          defaultValue={valor}
          placeholder="Buscar por nombre, teléfono, correo o ciudad"
          aria-label="Buscar contactos"
          onKeyDown={(e) => {
            if (e.key === 'Enter') buscar((e.target as HTMLInputElement).value);
          }}
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-subtle"
        />
      </div>
      {valor && (
        <button type="button" onClick={() => buscar('')} className="text-[12.5px] text-brand hover:text-brand-hover">
          Limpiar
        </button>
      )}
      <span className="ml-auto text-[12.5px] text-subtle">
        {total} contacto{total === 1 ? '' : 's'}
      </span>
    </div>
  );
}
