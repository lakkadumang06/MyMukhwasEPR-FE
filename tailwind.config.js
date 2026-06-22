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
        // MyMukhwas identity (matches the logo green #185830)
        brand: {
          50: '#eef6f1',
          100: '#d4e9db',
          200: '#a9d2b6',
          500: '#2a8050',
          600: '#1f6b40',
          700: '#185830', // logo green / deep headers
          800: '#134627',
          900: '#0d331c',
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
