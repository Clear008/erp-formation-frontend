/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d0ff',
          300: '#9ab3ff',
          400: '#6a8bff',
          500: '#3d5eff',
          600: '#2340f5',
          700: '#1a2fe0',
          800: '#1828b5',
          900: '#192690',
        },
        surface: {
          DEFAULT: '#0f1117',
          card: '#161b27',
          border: '#1e2535',
          muted: '#242b3d',
        },
        text: {
          primary: '#e8ecf4',
          secondary: '#8892a4',
          muted: '#4a5568',
        },
      },
    },
  },
  plugins: [],
}
