import { cookies } from 'next/headers';

const CDP_URL = process.env.CDP_URL ?? 'http://localhost:4003';
const CHAT_URL = process.env.CHAT_URL ?? 'http://localhost:4004';
const IDENTITY_URL = process.env.IDENTITY_URL ?? 'http://localhost:4001';

async function token(): Promise<string | null> {
  return (await cookies()).get('orbis_access')?.value ?? null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call<T>(base: string, path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = await token();
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(auth ? { authorization: `Bearer ${auth}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(data?.message ?? 'No pudimos completar la operación.', res.status);
  return data as T;
}

export const cdp = {
  get: <T>(path: string) => call<T>(CDP_URL, path),
  patch: <T>(path: string, body: unknown) => call<T>(CDP_URL, path, { method: 'PATCH', body }),
  del: <T>(path: string) => call<T>(CDP_URL, path, { method: 'DELETE' }),
};

export const chat = {
  get: <T>(path: string) => call<T>(CHAT_URL, path),
};

export interface Me {
  user: { id: string; name: string; email: string };
  brands: Array<{ brandId: string; brandName: string; role: string }>;
}

export async function getMe(): Promise<Me | null> {
  try {
    return await call<Me>(IDENTITY_URL, '/auth/me');
  } catch {
    return null;
  }
}

export async function activeBrandName(): Promise<string> {
  const me = await getMe();
  const auth = await token();
  if (!me || !auth) return '';
  try {
    const payload = JSON.parse(Buffer.from(auth.split('.')[1] ?? '', 'base64url').toString('utf8'));
    return me.brands.find((b) => b.brandId === payload.brandId)?.brandName ?? me.brands[0]?.brandName ?? '';
  } catch {
    return me.brands[0]?.brandName ?? '';
  }
}

// -------------------------------------------------------------------- tipos

export interface ContactRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  /** El nombre que mandó el canal (perfil de WhatsApp o Instagram). Llega desde el CDP con resumen de contactos. */
  profileName?: string | null;
  channels: string[];
  updatedAt: string;
}

export interface ContactPage {
  items: ContactRow[];
  total: number;
  page: number;
  pages: number;
}

export interface ContactDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  attributes: Record<string, unknown>;
  consent: Record<string, unknown>;
  anonymizedAt: string | null;
  createdAt: string;
  identities: Array<{ id: string; channelType: string; externalId: string; displayName: string | null }>;
  events: Array<{ id: string; type: string; payload: Record<string, unknown>; createdAt: string }>;
}

export interface ContactSummary {
  id: string;
  name: string | null;
  profileName: string | null;
  phone: string | null;
  channels: string[];
}

/**
 * Los posibles duplicados que el CDP dejó marcados en la historia: el teléfono
 * que dio la persona y las otras fichas que ya lo tienen. El agente no une
 * fichas solo (un número escrito en el chat no está verificado), así que aquí
 * se le muestra a la marca para que lo sepa.
 */
export function posiblesDuplicados(contacto: ContactDetail): Array<{ telefono: string | null; candidatos: string[] }> {
  return contacto.events
    .filter((e) => e.type === 'contacto.posible_duplicado')
    .map((e) => ({
      telefono: typeof e.payload.telefono === 'string' ? e.payload.telefono : null,
      candidatos: Array.isArray(e.payload.candidatos)
        ? e.payload.candidatos.filter((c): c is string => typeof c === 'string')
        : [],
    }));
}

export interface ConversationRow {
  id: string;
  status: 'bot' | 'human' | 'closed';
  channel: string;
  lastMessagePreview: string | null;
  lastMessageAt: string;
}

export const contactos = {
  list: (params: { search?: string; page?: number }) => {
    const q = new URLSearchParams({ limit: '20' });
    if (params.search) q.set('search', params.search);
    if (params.page && params.page > 1) q.set('page', String(params.page));
    return cdp.get<ContactPage>(`/contacts?${q}`);
  },
  get: (id: string) => cdp.get<ContactDetail>(`/contacts/${id}`),
  /** Nombre y teléfono de varios contactos a la vez (p. ej. los candidatos de un posible duplicado). */
  resumen: (ids: string[]) =>
    ids.length === 0
      ? Promise.resolve([] as ContactSummary[])
      : cdp.get<ContactSummary[]>(`/contacts/resumen?ids=${ids.join(',')}`).catch(() => [] as ContactSummary[]),
  conversations: (contactId: string) =>
    chat.get<ConversationRow[]>(`/conversations?contactId=${contactId}&limit=20`).catch(() => []),
};

const EVENTO: Record<string, string> = {
  'contacto.creado': 'Primer contacto',
  'contacto.actualizado': 'Datos actualizados',
  'contacto.anonimizado': 'Datos eliminados por solicitud',
  'contacto.canal_vinculado': 'Se reconoció por su teléfono en un canal nuevo',
  'contacto.posible_duplicado': 'Posible duplicado',
};

export function nombreEvento(tipo: string): string {
  return EVENTO[tipo] ?? tipo;
}

export function cuando(iso: string): string {
  const fecha = new Date(iso);
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  if (minutos < 60 * 24) return `hace ${Math.floor(minutos / 60)} h`;
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
