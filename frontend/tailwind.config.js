/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kjg: {
          primary: '#0a4a8f',
          accent: '#e63946',
        },
      },
    },
  },
  plugins: [],
};
