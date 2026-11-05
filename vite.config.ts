import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Porta fixa, para não conflitar com outros projetos Vite abertos (Agenda Lotada usa 5180)
  server: { port: 5190, strictPort: true, host: true },
  preview: { port: 4190, strictPort: true, host: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'LashBox',
        short_name: 'LashBox',
        description: 'A caixa de ferramentas da lash designer: artes, ofertas e mensagens prontas.',
        lang: 'pt-BR',
        start_url: '/inicio',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFFFFF',
        theme_color: '#5B2A4E',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,webp,ico}'],
        // As imagens originais só servem para gerar os ícones; não precisam ir para o cache do app
        globIgnores: ['**/icone-lashbox.png', '**/logo-lashbox.png'],
      },
    }),
  ],
})
