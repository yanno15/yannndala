import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // ✅ Code splitting — réduit le JS initial
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor':      ['lucide-react', 'react-hot-toast'],
          'supabase':       ['@supabase/supabase-js'],
        },
      },
    },
    // ✅ Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Supprime les console.log en prod
        drop_debugger: true,
      },
    },
    // ✅ Avertir si chunk > 500kb
    chunkSizeWarningLimit: 500,
  },

  // ✅ Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
})
