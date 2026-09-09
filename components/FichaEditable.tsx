'use client';

import { useState, useTransition } from 'react';
import { Button, Field, Input } from '@orbis-sales/ui';
import type { ContactDetail } from '@/lib/api';
import { anonymizeContact, updateContact } from '@/app/actions';

export function FichaEditable({ contacto }: { contacto: ContactDetail }) {
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [guardado, setGuardado] = useState(false);

  const [name, setName] = useState(contacto.name ?? '');
  const [email, setEmail] = useState(contacto.email ?? '');
  const [phone, setPhone] = useState(contacto.phone ?? '');
  const [city, setCity] = useState(contacto.city ?? '');
  const [address, setAddress] = useState(contacto.address ?? '');

  const guardar = () => {
    setError(undefined);
    setGuardado(false);
    startTransition(async () => {
      const res = await updateContact(contacto.id, {
        name: name.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,
      });
      if (res.error) setError(res.error);
      else {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
      }
    });
  };

  const atributos = Object.entries(contacto.attributes ?? {});

  return (
    <section className="rounded-lg border border-border bg-bg p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Datos del contacto</h2>
        <p className="text-[12.5px] text-muted">
          El agente los completa solo durante la conversación; aquí se corrigen a mano.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="Teléfono">{(p) => <Input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} />}</Field>
        <Field label="Correo">{(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Ciudad">{(p) => <Input {...p} value={city} onChange={(e) => setCity(e.target.value)} />}</Field>
        <div className="sm:col-span-2">
          <Field label="Dirección" hint="La que use el agente para calcular el envío.">
            {(p) => <Input {...p} value={address} onChange={(e) => setAddress(e.target.value)} />}
          </Field>
        </div>
      </div>

      {atributos.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.09em] text-subtle">
            Datos propios de tu negocio
          </p>
          <dl className="flex flex-wrap gap-2">
            {atributos.map(([clave, valor]) => (
              <div key={clave} className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px]">
                <dt className="inline text-muted">{clave}: </dt>
                <dd className="inline font-medium">{String(valor)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-[8px] border border-danger bg-danger-soft px-3 py-2 text-[13px] text-danger-ink">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        <Button variant="primary" onClick={guardar} loading={pendiente}>
          Guardar cambios
        </Button>
        {guardado && <span className="text-[13px] text-success-ink">Guardado</span>}

        {!contacto.anonymizedAt && (
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => {
              if (
                confirm(
                  'Esto elimina el nombre, el teléfono, el correo y la dirección de esta persona, y borra sus identidades de canal. El historial de conversaciones se conserva sin datos identificables, y no se puede deshacer. ¿Continuar?',
                )
              ) {
                startTransition(async () => {
                  const res = await anonymizeContact(contacto.id);
                  if (res?.error) setError(res.error);
                });
              }
            }}
          >
            Eliminar datos personales
          </Button>
        )}
      </div>
    </section>
  );
}
