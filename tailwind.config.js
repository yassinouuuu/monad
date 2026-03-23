/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          purple: "#836EF9",
          magenta: "#FF00FF",
          dark: "#0a0a0a",
          card: "rgba(131, 110, 249, 0.05)",
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(131, 110, 249, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(131, 110, 249, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
