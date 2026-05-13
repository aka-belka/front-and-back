import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
      react(),
      visualizer({
          filename: 'bundle-report.html',
          open: true,
          gzipSize: true,
      }),
  ],
  build: {
      rollupOptions: {
          output: {
              manualChunks(id) {
                  if (id.includes('node_modules')) {
                      if (id.includes('react-router-dom') || id.includes('react')) {
                          return 'vendor';
                      }
                      return 'vendor-other';
                  }
              },
          },
      },
    },
})
