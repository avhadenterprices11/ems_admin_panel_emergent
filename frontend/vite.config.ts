import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['eventflow-152.preview.emergentagent.com', 'eventflow-151.preview.emergentagent.com', 'eventpanel-3.preview.emergentagent.com', 'eventmanager-18.preview.emergentagent.com', 'localhost', '127.0.0.1'],
  },
})
