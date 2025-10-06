// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      keyframes: {
        // 提案1: 強い点滅（Flash）
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.1' },
        },
        // 提案2: 枠が脈打つように光る（Pulse Glow）
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 20px 10px rgba(239, 68, 68, 0)' },
        },
        // 提案3: アイコンが小刻みに揺れる（Shake）
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        flash: 'flash 1s infinite',
        'pulse-glow': 'pulse-glow 1.5s infinite',
        shake: 'shake 0.5s infinite',
      },
    },
  },
  plugins: [],
}