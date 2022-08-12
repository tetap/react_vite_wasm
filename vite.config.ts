import { defineConfig } from 'vite'
import path from 'path'
import ViteRsw from 'vite-plugin-rsw'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ViteRsw()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
