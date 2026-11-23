import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// VITE_API_TARGET=http://127.0.0.1:8010 points the proxy at a local backend.
const apiProxy = {
  '/api': {
    target: process.env.VITE_API_TARGET ?? 'https://api.v3.emasteryacademy.com',
    changeOrigin: true,
    secure: true,
  },
}

// Tunnels used to share the local site (ngrok free URLs change each session,
// so allow the whole domain). A leading dot matches every subdomain.
const allowedHosts = ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: apiProxy, allowedHosts },
  preview: { proxy: apiProxy, allowedHosts },
})
