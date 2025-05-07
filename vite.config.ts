import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Use VITE_GHPAGES env variable to control base path
const isGitHubPages = process.env.VITE_GHPAGES === 'true';

export default defineConfig({
  base: isGitHubPages ? '/AuteurEye/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})