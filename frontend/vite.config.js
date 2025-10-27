import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'codebase-cleaner.preview.emergentagent.com',
      '.preview.emergentagent.com',
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      overlay: true,
      // Prevent aggressive HMR that causes flickering
      protocol: 'wss'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        // Prevent proxy from causing issues
        ws: true
      }
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
  },
  // Prevent aggressive rebuilds
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})