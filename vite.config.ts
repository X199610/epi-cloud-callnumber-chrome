import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json' assert { type: 'json' }
import path from 'path'
import proxy from './src/config/proxy'
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  plugins: [vue(), crx({ manifest }), vueJsx()],
  server: {
    host: '0.0.0.0',
    port: 7001,
    proxy,
  },
})
