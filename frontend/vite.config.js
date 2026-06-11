// Import the defineConfig function from Vite
import { defineConfig } from 'vite'
// Import the React plugin for Vite
import react from '@vitejs/plugin-react'

// Export Vite configuration
// defineConfig provides type hints and intellisense for the config
export default defineConfig({
  // Plugins to use with Vite
  plugins: [
    // React plugin - enables JSX support and fast refresh
    react(),
  ],
  // Development server configuration
  server: {
    // Port the development server runs on
    port: 5173,
    // Open browser automatically when server starts
    open: true,
    // Host to listen on
    host: 'localhost',
  },
  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Source map for debugging (disabled in production)
    sourcemap: false,
  },
})
