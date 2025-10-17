import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VueGuideStudio',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'vue-guide-studio.mjs' : 'vue-guide-studio.cjs'),
    },
    rollupOptions: {
      external: ['vue', 'driver.js'],
      output: {
        globals: {
          vue: 'Vue',
          'driver.js': 'Driver',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
