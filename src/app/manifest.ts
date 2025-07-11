import { type MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'One Y.Z.',
    short_name: 'One Y.Z.',
    description: 'One Y.Z. ile modern portföy yönetim aracınız.',
    start_url: '/',
    display: 'standalone',
    background_color: '#18181a',
    theme_color: '#18181a',
    icons: [
      {
        src: '/192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/192.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/192.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
  }
}
