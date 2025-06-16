import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/swal.ts'),
      name: 'Swal',
      fileName: (format) => `swal.${format}.js`,
      formats: ['umd']
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'swal.css';
          return assetInfo.name;
        },
        globals: {},
        name: 'Swal'
      }
    }
  },
  root: 'demo'
})