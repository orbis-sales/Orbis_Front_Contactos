import Link from 'next/link';
import { PageHeader } from '@orbis/ui';
import { CANAL, contactos, cuando } from '@/lib/api';
import { Buscador } from '@/components/Buscador';
import { Paginacion } from '@/components/Paginacion';

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await contactos
    .list({ search: params.search, page })
    .catch(() => ({ items: [], total: 0, page: 1, pages: 1 }));

  const buscando = Boolean(params.search);

  return (
    <>
      <PageHeader
        title="Contactos"
        description="Una ficha por persona, sin importar por dónde escriba. Se crean solas con la primera conversación."
        bordered={false}
      />

      <div className="flex flex-col gap-4 px-6 pb-8">
        <Buscador valor={params.search ?? ''} total={data.total} />

        {data.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-strong bg-surface p-10 text-center">
            <p className="text-[15px] font-medium">
              {buscando ? 'Nadie coincide con esa búsqueda' : 'Todavía no hay contactos'}
            </p>
            <p className="mx-auto mt-1 max-w-[54ch] text-[13.5px] text-muted">
              {buscando
                ? 'Prueba con el teléfono, el correo o parte del nombre.'
                : 'Cuando alguien escriba por cualquier canal, su ficha aparece aquí sola, con el canal por el que llegó.'}
            </p>
          </div>
        ) : (
          <section className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-[13.5px]">
              <thead>
                <tr className="border-b border-border-strong">
                  <Th>Persona</Th>
                  <Th>Teléfono</Th>
                  <Th>Ciudad</Th>
                  <Th>Canales</Th>
                  <Th align="right">Última actividad</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                    <td className="h-11 px-4">
                      <Link href={`/${c.id}`} className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted">
                          {iniciales(c.name)}
                        </span>
                        <span className="font-medium">{c.name ?? 'Sin nombre'}</span>
                        {c.email && <span className="text-[12.5px] text-subtle">{c.email}</span>}
                      </Link>
                    </td>
                    <td className="h-11 px-4 font-mono text-[12.5px] text-muted">{c.phone ?? '—'}</td>
                    <td className="h-11 px-4 text-muted">{c.city ?? '—'}</td>
                    <td className="h-11 px-4">
                      <span className="flex items-center gap-1.5">
                        {c.channels.length === 0 && <span className="text-muted">—</span>}
                        {c.channels.map((canal) => (
                          <span
                            key={canal}
                            title={CANAL[canal]?.nombre ?? canal}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: CANAL[canal]?.color ?? 'var(--orbis-text-subtle)' }}
                          />
                        ))}
                      </span>
                    </td>
                    <td className="h-11 px-4 text-right font-mono text-[12.5px] text-muted">{cuando(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <Paginacion page={data.page} pages={data.pages} total={data.total} />
      </div>
    </>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 pb-2.5 pt-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function iniciales(nombre: string | null): string {
  if (!nombre) return '··';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
