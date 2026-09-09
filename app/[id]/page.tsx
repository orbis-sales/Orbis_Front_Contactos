import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, PageHeader } from '@orbis-sales/ui';
import { ApiError, CANAL, contactos, cuando, nombreEvento } from '@/lib/api';
import { FichaEditable } from '@/components/FichaEditable';

export default async function ContactoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contacto = await contactos.get(id).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });
  const conversaciones = await contactos.conversations(id);

  return (
    <>
      <PageHeader
        title={contacto.name ?? 'Sin nombre'}
        description={`Contacto desde ${new Date(contacto.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}`}
        actions={
          <Link href="/">
            <span className="flex h-[31px] items-center rounded-[7px] border border-border-strong px-3 text-[13px] font-medium hover:bg-surface-2">
              Volver
            </span>
          </Link>
        }
      />

      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          {contacto.anonymizedAt && (
            <p className="rounded-r-lg border border-l-[3px] border-border border-l-warning bg-warning-soft px-4 py-3 text-[13px] text-warning-ink">
              Los datos personales de este contacto se eliminaron por solicitud del titular el{' '}
              {new Date(contacto.anonymizedAt).toLocaleDateString('es-CO')}. El historial de conversaciones se conserva
              sin datos identificables.
            </p>
          )}

          <FichaEditable contacto={contacto} />

          <section className="overflow-hidden rounded-lg border border-border">
            <header className="border-b border-border bg-surface px-4 py-2.5">
              <h2 className="font-mono text-[10.5px] uppercase tracking-[0.09em] text-subtle">Conversaciones</h2>
            </header>
            {conversaciones.length === 0 ? (
              <p className="px-4 py-5 text-[13px] text-muted">Todavía no ha escrito por ningún canal.</p>
            ) : (
              <ul>
                {conversaciones.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                    <span
                      className="h-2.5 w-2.5 flex-none rounded-full"
                      style={{ background: CANAL[c.channel]?.color ?? 'var(--orbis-text-subtle)' }}
                      title={CANAL[c.channel]?.nombre ?? c.channel}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px]">{c.lastMessagePreview ?? 'Sin mensajes'}</span>
                      <span className="block font-mono text-[11.5px] text-subtle">{cuando(c.lastMessageAt)}</span>
                    </span>
                    {c.status === 'bot' && <Badge tone="brand">Agente</Badge>}
                    {c.status === 'human' && <Badge tone="warning">Asesor</Badge>}
                    {c.status === 'closed' && <Badge tone="neutral">Cerrada</Badge>}
                    <a href={`/chat`} className="text-[12.5px] text-brand hover:text-brand-hover">
                      Abrir
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.09em] text-subtle">
              Cómo se llega a esta persona
            </h2>
            {contacto.identities.length === 0 ? (
              <p className="text-[13px] text-muted">Sin identidades. Se eliminaron con los datos personales.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {contacto.identities.map((i) => (
                  <li key={i.id} className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 flex-none rounded-full"
                      style={{ background: CANAL[i.channelType]?.color ?? 'var(--orbis-text-subtle)' }}
                    />
                    <span className="text-[13px]">{CANAL[i.channelType]?.nombre ?? i.channelType}</span>
                    <span className="ml-auto truncate font-mono text-[11.5px] text-subtle" title={i.externalId}>
                      {i.externalId.length > 18 ? `${i.externalId.slice(0, 16)}…` : i.externalId}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[12px] text-subtle">
              La misma persona por dos canales es un solo contacto: eso es lo que une esta ficha.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.09em] text-subtle">Historia</h2>
            {contacto.events.length === 0 ? (
              <p className="text-[13px] text-muted">Sin eventos.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {contacto.events.slice(0, 12).map((e) => (
                  <li key={e.id} className="flex gap-2.5">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                    <span className="min-w-0">
                      <span className="block text-[13px]">{nombreEvento(e.type)}</span>
                      <span className="block font-mono text-[11.5px] text-subtle">{cuando(e.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {Object.keys(contacto.consent).length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.09em] text-subtle">Consentimiento</h2>
              <dl className="flex flex-col gap-1.5 text-[12.5px]">
                {Object.entries(contacto.consent).map(([clave, valor]) => (
                  <div key={clave} className="flex justify-between gap-3">
                    <dt className="text-muted">{clave}</dt>
                    <dd className="truncate text-right">{String(valor)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
