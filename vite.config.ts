
import { defineConfig } from 'vite';

export default defineConfig({
  // Force Vite to exclude these from pre-bundling, so they resolve via importmap in dev
  optimizeDeps: {
    exclude: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'lucide-react',
      'recharts',
      '@google/genai'
    ]
  },
  build: {
    rollupOptions: {
      // Ensure these are treated as external in the final bundle
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
    // Polyfill process.env for browser compatibility if libs require it
    'process.env': {} 
  }
});
