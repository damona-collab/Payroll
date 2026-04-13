/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e5',
          200: '#9eb0d3',
          300: '#7790c1',
          400: '#5878b4',
          500: '#3a60a7',
          600: '#2f529a',
          700: '#234188',
          800: '#173075',
          900: '#0f2557',
          950: '#091840',
        },
        cream: {
          50:  '#fdfcfa',
          100: '#faf6ef',
          200: '#f5ede0',
          300: '#eee0cc',
          400: '#e5d0b5',
          500: '#d9bc99',
          600: '#c9a87a',
          700: '#b5905a',
          800: '#96723d',
          900: '#755527',
        },
        gold: {
          400: '#d4a843',
          500: '#c9953a',
          600: '#b8822e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
