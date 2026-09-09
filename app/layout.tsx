import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AppFrame, BrandChip } from '@orbis-sales/ui';
import { activeBrandName, getMe } from '@/lib/api';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contactos · Orbis-AI',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('orbis_theme')?.value;
  const me = await getMe();
  const brandName = await activeBrandName();
  const initials = (me?.user.name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <html lang="es" data-theme={theme === 'light' || theme === 'dark' ? theme : undefined}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="bg-bg text-text antialiased">
        <AppFrame
          currentPath="/contactos"
          brandSlot={brandName ? <BrandChip name={brandName} /> : null}
          userSlot={
            <a
              href="/inicio"
              title={me?.user.name ?? 'Tu cuenta'}
              className="grid h-[26px] w-[26px] place-items-center rounded-full bg-brand text-[11px] font-semibold text-on-brand"
            >
              {initials}
            </a>
          }
        >
          {children}
        </AppFrame>
      </body>
    </html>
  );
}
