'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, cdp } from '@/lib/api';

export interface ActionState {
  error?: string;
  ok?: boolean;
}

function toState(err: unknown): ActionState {
  if (err instanceof ApiError) return { error: err.message };
  return { error: 'No pudimos conectar con el servicio de contactos.' };
}

export async function updateContact(
  id: string,
  input: { name?: string | null; email?: string | null; phone?: string | null; city?: string | null; address?: string | null },
): Promise<ActionState> {
  try {
    await cdp.patch(`/contacts/${id}`, input);
    revalidatePath(`/${id}`);
    revalidatePath('/');
    return { ok: true };
  } catch (err) {
    return toState(err);
  }
}

/**
 * Borrado por solicitud del titular. No borra la fila: anonimiza los datos
 * personales y conserva los agregados de negocio (D24 y el CDP).
 */
export async function anonymizeContact(id: string): Promise<ActionState> {
  try {
    await cdp.del(`/contacts/${id}`);
  } catch (err) {
    return toState(err);
  }
  revalidatePath('/');
  redirect('/');
}
