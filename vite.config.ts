
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Removed optimizeDeps.exclude and build.rollupOptions.external
  // to force Vite to bundle React, ReactDOM, and Router.
  // This ensures a single React instance and fixes the "Objects are not valid as a React child" error.
  build: {
    rollupOptions: {
      external: [
        // Keep Google GenAI external as it's loaded via importmap/CDN to save bundle size
        '@google/genai'
      ]
    }
  }
});
