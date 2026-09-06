import { NextResponse, type NextRequest } from 'next/server';

/**
 * Corta el paso a una marca suspendida por facturación.
 *
 * Cada zona es una app Next independiente, así que el layout del shell no la
 * envuelve: sin esto, una marca bloqueada entraría a los contactos escribiendo la
 * URL. El estado viaja en el token, que dura 15 minutos, de modo que una
 * suspensión se aplica aquí a más tardar en ese plazo.
 *
 * Esto es comodidad y claridad para quien navega, no la barrera: la barrera
 * está en el guard de cada servicio, que rechaza igual aunque alguien llegue
 * directo al API.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get('orbis_access')?.value;
  if (!token) return NextResponse.next();

  // Solo se lee el contenido; la firma la valida el back en cada llamada.
  let brandStatus: string | null = null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    );
    brandStatus = payload?.brandStatus ?? null;
  } catch {
    return NextResponse.next();
  }

  if (brandStatus !== 'suspended') return NextResponse.next();

  // El shell es quien muestra la pantalla de bloqueo con el motivo.
  return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  // Todo salvo los estáticos de Next.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
