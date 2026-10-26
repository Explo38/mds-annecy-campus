import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // `host: true` écoute sur toutes les interfaces : l'application devient
    // joignable depuis un autre appareil du même réseau (le téléphone d'un
    // testeur, par exemple), et pas seulement depuis localhost.
    host: true,
    port: 5173,
  },
  preview: {
    // Même chose pour le build de production, servi par `npm run partage`.
    host: true,
    port: 4173,
  },
})
