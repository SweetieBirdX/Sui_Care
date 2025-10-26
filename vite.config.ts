import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/walrus-api': {
        target: 'https://publisher.walrus-testnet.h2o-nodes.com',
        changeOrigin: true, // Başlıkları Walrus sunucusu gibi göstermeyi sağlar
        rewrite: (path) => path.replace(/^\/walrus-api/, ''), // /walrus-api yolunu kaldırır
        secure: true, // HTTPS için gereklidir
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔄 Walrus Proxy Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Sending Request to Walrus:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Received Response from Walrus:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Alternative Walrus endpoints for fallback
      '/walrus-alt': {
        target: 'https://publisher.walrus-testnet.walrus.space',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/walrus-alt/, ''),
        secure: true,
      },
      '/walrus-http': {
        target: 'http://walrus-publisher-testnet.haedal.xyz:9001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/walrus-http/, ''),
        secure: false, // HTTP için false
      },
    },
  },
  define: {
    // Only expose specific environment variables for browser
    'process.env.VITE_WALRUS_JWT_TOKEN': JSON.stringify(process.env.VITE_WALRUS_JWT_TOKEN),
  },
});