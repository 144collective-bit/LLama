import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vite's default 5173 is often taken by another project.
  server: { port: 5180 },
  preview: { port: 5181 },
})
