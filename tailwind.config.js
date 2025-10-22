/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
      colors: {
        beige: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ebe4d8',
          400: '#ddd3c3',
          500: '#c9baa8',
          600: '#b5a28f',
          700: '#9a8876',
          800: '#7d6f5e',
          900: '#5f5447',
        },
        cream: {
          50: '#fffef9',
          100: '#fffcf0',
          200: '#fef9e7',
          300: '#fdf5d9',
          400: '#fbefc4',
          500: '#f8e7a8',
          600: '#f0d88a',
          700: '#e5c66d',
          800: '#d6b254',
          900: '#c19d3e',
        }
      },
      backgroundColor: {
        'primary': '#fdfcfb',
        'secondary': '#f5f1ea',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
