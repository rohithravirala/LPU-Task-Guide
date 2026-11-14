import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Fail loudly instead of silently switching ports: the API's CORS allow-list
    // (backend CLIENT_ORIGINS) expects this exact origin.
    strictPort: true,
  },
})
