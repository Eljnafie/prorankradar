import { defineConfig } from 'vite';

export default defineConfig({
  // Force classic JSX to use the global 'React' identifier from importmap
  // This prevents 'Minified React error #31' caused by dual-react instances (runtime vs bundled)
  esbuild: {
    jsx: 'transform',
  },
  // Prevent Vite from bundling these dependencies in dev mode
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
    // Treat these as external in production bundle
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
    'process.env': {} 
  }
});