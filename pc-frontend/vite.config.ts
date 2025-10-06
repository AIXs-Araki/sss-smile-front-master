import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer'
import circularDependency from 'vite-plugin-circular-dependency';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),

    circularDependency({
      exclude: /node_modules/,
    }),
    visualizer({
      open: true, // ビルド後に自動的にブラウザでレポートを開く
      filename: 'dist/stats.html', // 出力するファイル名
    }),
  ],
  define: {
    // ビルド日時を文字列として環境変数に埋め込む
    'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(new Date().toLocaleString('ja-JP')),
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query',],
  },
})