/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbf7',
          100: '#d5f5e5',
          200: '#aaebcd',
          300: '#74dcb1',
          400: '#3fc48d',
          500: '#20a86f',
          600: '#14875a',
          700: '#126c49',
          800: '#11563c',
          900: '#0e4733'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)'
      }
    },
  },
  plugins: [],
}

