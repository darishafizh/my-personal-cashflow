import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CashFlow — Keuangan Pribadi',
    short_name: 'CashFlow',
    description: 'Kelola keuangan pribadi: pemasukan, pengeluaran, budget, dan hutang piutang.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A1A',
    theme_color: '#0A0A1A',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
