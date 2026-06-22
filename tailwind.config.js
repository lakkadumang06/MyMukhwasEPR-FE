/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './features/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // MyMukhwas identity (matches the spreadsheet)
        brand: {
          50: '#eef4fb',
          100: '#d9e6f5',
          500: '#2b6cb0',
          600: '#1f4e79', // deep blue headers
          700: '#173a5c',
          900: '#0f273e',
        },
        accent: '#c0182c', // red banners
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
