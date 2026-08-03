import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { ToastProvider } from "@/contexts/toast-context";

export const metadata: Metadata = {
  title: 'CashFlow — Kelola Keuangan Pribadi',
  description: 'Aplikasi keuangan pribadi untuk mencatat pemasukan, pengeluaran, budget, dan hutang piutang.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CashFlow',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A1A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="icon" href="/icon.png?v=4" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/icon.png?v=4" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png?v=4" />
      </head>
      <body className="min-h-dvh flex flex-col relative">
        <ToastProvider>
          <Providers>
            <div className="relative z-10 flex flex-col min-h-dvh">
              {children}
            </div>
          </Providers>
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `,
      }}
    />
  );
}
