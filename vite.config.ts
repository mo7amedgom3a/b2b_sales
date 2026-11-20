import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const apiProxy = {
  '/api': {
    target: 'https://api.v3.emasteryacademy.com',
    changeOrigin: true,
    secure: true,
  },
}

// Tunnels used to share the local site (ngrok free URLs change each session,
// so allow the whole domain). A leading dot matches every subdomain.
const allowedHosts = ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: apiProxy, allowedHosts },
  preview: { proxy: apiProxy, allowedHosts },
})
