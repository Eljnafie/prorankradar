
import { defineConfig } from 'vite';

export default defineConfig({
  // Force esbuild to transform JSX to React.createElement
  // This is compatible with importing 'React' from esm.sh
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
