import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        /**
         * Split the vendor libraries out of the app bundle.
         *
         * These change far less often than application code, so giving
         * them their own hashed files means a normal deploy only
         * invalidates the small app chunk and returning visitors keep
         * the cached vendor code.
         */
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-state': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['react-icons', 'react-hot-toast', 'axios'],
        },
      },
    },
    // The app chunk sits comfortably under this once vendors are split.
    chunkSizeWarningLimit: 600,
  },
})
