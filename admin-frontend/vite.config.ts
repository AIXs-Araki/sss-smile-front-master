import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  define: {
    // ビルド日時を文字列として環境変数に埋め込む
    'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(new Date().toLocaleString('ja-JP')),
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query',],
  },
})