/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070A13',
          card: '#0D1322',
          panel: '#131B30',
          border: '#1F2B48',
          cyan: '#06B6D4',
          'cyan-glow': '#22D3EE',
          purple: '#A855F7',
          'purple-glow': '#C084FC',
          red: '#EF4444',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'neon-purple': '0 0 25px -3px rgba(168, 85, 247, 0.45)',
        'neon-red': '0 0 25px -3px rgba(239, 68, 68, 0.45)',
        'neon-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
}
