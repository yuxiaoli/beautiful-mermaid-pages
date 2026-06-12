import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves project sites from /<repo-name>/.
// The deploy workflow passes the repo name via the BASE_PATH env var so assets
// resolve correctly. Falls back to '/' for local dev and user/organization pages.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue()],
})
