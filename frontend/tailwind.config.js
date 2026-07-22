/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f1fd',
          100: '#e4e2fb',
          200: '#c8c4f7',
          300: '#a29bf0',
          400: '#8177e8',
          500: '#6a5cdb',
          600: '#5b4fd1',
          700: '#4c40b8',
          900: '#2f2678',
        },
      },
    },
  },
  plugins: [],
};
