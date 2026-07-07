import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the built app loads from file:// in the Electron shell
  base: './',
  plugins: [react()],
})
