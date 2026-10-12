import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, CHANNEL_LABEL, ChannelLogo, PageHeader, nombreVisible } from '@orbis-sales/ui';
import { ApiError, contactos, cuando, nombreEvento } from '@/lib/api';
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
        title={
          nombreVisible({
            name: contacto.name,
            profileName: contacto.identities.find((i) => i.displayName)?.displayName,
            phone: contacto.phone,
            channel: contacto.identities[0]?.channelType,
          }).nombre
        }
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
            <p className="rounded-xl bg-warning-soft px-4 py-3 text-[13px] text-warning-ink">
              Los datos personales de este contacto se eliminaron por solicitud del titular el{' '}
              {new Date(contacto.anonymizedAt).toLocaleDateString('es-CO')}. El historial de conversaciones se conserva
              sin datos identificables.
            </p>
          )}

          <FichaEditable contacto={contacto} />

          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-[14px] font-semibold text-text">Conversaciones</h2>
            </header>
            {conversaciones.length === 0 ? (
              <p className="px-4 py-5 text-[13px] text-muted">Todavía no ha escrito por ningún canal.</p>
            ) : (
              <ul>
                {conversaciones.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                    <ChannelLogo channel={c.channel} size={16} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px]">{c.lastMessagePreview ?? 'Sin mensajes'}</span>
                      <span className="block text-[12px] tabular-nums text-subtle">{cuando(c.lastMessageAt)}</span>
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
          <section className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-[14px] font-semibold text-text">
              Cómo se llega a esta persona
            </h2>
            {contacto.identities.length === 0 ? (
              <p className="text-[13px] text-muted">Sin identidades. Se eliminaron con los datos personales.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {contacto.identities.map((i) => (
                  <li key={i.id} className="flex items-center gap-2.5">
                    <ChannelLogo channel={i.channelType} size={16} decorative />
                    <span className="text-[13px]">
                      {CHANNEL_LABEL[i.channelType as keyof typeof CHANNEL_LABEL] ?? i.channelType}
                      {i.displayName && <span className="text-muted"> · {i.displayName}</span>}
                    </span>
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

          <section className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-[14px] font-semibold text-text">Historia</h2>
            {contacto.events.length === 0 ? (
              <p className="text-[13px] text-muted">Sin eventos.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {contacto.events.slice(0, 12).map((e) => (
                  <li key={e.id} className="flex gap-2.5">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                    <span className="min-w-0">
                      <span className="block text-[13px]">{nombreEvento(e.type)}</span>
                      <span className="block text-[12px] tabular-nums text-subtle">{cuando(e.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {Object.keys(contacto.consent).length > 0 && (
            <section className="rounded-xl border border-border bg-surface p-4">
              <h2 className="mb-2 text-[14px] font-semibold text-text">Consentimiento</h2>
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
