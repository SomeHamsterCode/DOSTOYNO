import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Название вашего репозитория - ключ к решению!
const repoName = 'DOSTOYNO'

export default defineConfig({
  // Правильный base для GitHub Pages
  base: '/DOSTOYNO/',
  plugins: [react()], // Уберите viteSingleFile(), если он есть!
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false, // Для чистоты можно отключить
  }
})
