import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og.png',
        // Self-host edilmiş fontlar da ön-belleğe girmeli; yoksa çevrimdışı
        // açılışta sistem fontuna düşer.
        'fonts/*.woff2',
      ],
      manifest: {
        name: 'Lunara',
        short_name: 'Lunara',
        description: 'Kadın sağlığı yaşam-evresi takip uygulaması',
        lang: 'tr',
        theme_color: '#F4ECDC',
        background_color: '#FBF6EB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
