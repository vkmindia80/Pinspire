import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'pinpost-scheduler.preview.emergentagent.com',
      '.preview.emergentagent.com',
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      host: 'pinpost-scheduler.preview.emergentagent.com'
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    'process.env': process.env
  }
})