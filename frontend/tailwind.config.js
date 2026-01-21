/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f3',
          100: '#ffe0e5',
          200: '#ffc2cc',
          300: '#ff9aa9',
          400: '#ff6c7f',
          500: '#ed3b4d', // primary accent
          600: '#d4203a',
          700: '#b41431',
          800: '#920f2a',
          900: '#7a0d24'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)'
      }
    },
  },
  plugins: [],
}

