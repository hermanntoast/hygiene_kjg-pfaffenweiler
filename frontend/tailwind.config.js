/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kjg: {
          blue: '#1568A6',
          'blue-ink': '#0F4F80',
          primary: '#059669',
          'primary-hover': '#047857',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
      },
      maxWidth: {
        app: '480px',
      },
      boxShadow: {
        cta: '0 10px 15px -3px rgba(5,93,69,0.20)',
        app: '0 0 0 1px #E2E8F0',
        'app-desktop':
          '0 30px 60px -20px rgba(0,0,0,0.18), 0 0 0 1px #E2E8F0',
      },
    },
  },
  plugins: [],
};
