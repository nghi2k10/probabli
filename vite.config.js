import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-router-dom')) return 'vendor-router';
          if (id.includes('recharts')) return 'vendor-recharts';
          if (id.includes('framer-motion')) return 'vendor-framer-motion';
          if (id.includes('canvas-confetti')) return 'vendor-confetti';
          if (/node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)) return 'vendor-react';
          if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('lucide-react')) return 'vendor-ui';
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
