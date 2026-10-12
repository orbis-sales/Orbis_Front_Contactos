import Link from 'next/link';
import { CHANNEL_LABEL, ChannelLogo, ContactAvatar, PageHeader, formatearTelefono, nombreVisible } from '@orbis-sales/ui';
import { contactos, cuando } from '@/lib/api';
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
          <div className="rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center">
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
          <section className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[720px] text-[13.5px]">
              <thead>
                <tr className="border-b border-border">
                  <Th>Persona</Th>
                  <Th>Le escribe por</Th>
                  <Th>Teléfono</Th>
                  <Th>Ciudad</Th>
                  <Th align="right">Última actividad</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => {
                  // Nunca un id ni "Sin nombre" a secas: el perfil del canal o el
                  // teléfono también identifican a la persona.
                  const n = nombreVisible({ name: c.name, profileName: c.profileName, phone: c.phone, channel: c.channels[0] });
                  return (
                    <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                      <td className="h-[52px] px-4">
                        <Link href={`/${c.id}`} className="flex items-center gap-3">
                          <ContactAvatar name={n.nombre} anonymous={n.anonimo} seed={c.id} size={30} />
                          <span className="min-w-0">
                            <span className={n.anonimo ? 'block font-medium text-muted' : 'block font-semibold'}>
                              {n.nombre}
                            </span>
                            {n.anonimo ? (
                              <span className="block text-[12px] text-subtle">Sin nombre todavía</span>
                            ) : (
                              c.email && <span className="block text-[12px] text-subtle">{c.email}</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="h-[52px] px-4">
                        <span className="flex items-center gap-1.5">
                          {c.channels.length === 0 && <span className="text-subtle">Ninguno todavía</span>}
                          {c.channels.map((canal) => (
                            <ChannelLogo key={canal} channel={canal} size={16} />
                          ))}
                          <span className="sr-only">{c.channels.map((canal) => CHANNEL_LABEL[canal as keyof typeof CHANNEL_LABEL] ?? canal).join(', ')}</span>
                        </span>
                      </td>
                      <td className="h-[52px] px-4 tabular-nums text-muted">
                        {c.phone ? formatearTelefono(c.phone) : <span className="text-subtle">Sin registrar</span>}
                      </td>
                      <td className="h-[52px] px-4 text-muted">{c.city ?? <span className="text-subtle">Sin registrar</span>}</td>
                      <td className="h-[52px] px-4 text-right tabular-nums text-muted">{cuando(c.updatedAt)}</td>
                    </tr>
                  );
                })}
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
      className={`px-4 pb-2.5 pt-3 text-[12.5px] font-semibold text-subtle ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
