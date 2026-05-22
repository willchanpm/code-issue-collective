import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vite config ties together the dev server, React, and PWA behavior.
export default defineConfig({
  server: {
    // Forward API calls to the Express server during local development.
    proxy: {
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
  plugins: [
    react(),
    VitePWA({
      // Auto-register the service worker when the app loads in the browser.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Tamagotcha',
        short_name: 'Tamagotcha',
        description:
          'Turn a polaroid photo of your friend into an interactive tamagotchi.',
        theme_color: '#fff8ef',
        background_color: '#fff8ef',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
