
import { defineConfig } from 'vite';

export default defineConfig({
  // Removed react() plugin to avoid conflict with CDN React instance
  esbuild: {
    jsxInject: `import React from 'react'`, // Auto-inject React for JSX
  },
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'lucide-react',
        'recharts',
        '@google/genai'
      ]
    }
  },
  define: {
    // Prevent crashes if code accesses process.env
    'process.env': {} 
  }
});
