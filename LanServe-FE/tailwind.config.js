/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 600: '#2563eb', 700: '#1d4ed8' },
        accent: '#f97316'
      },
      boxShadow: { card: '0 10px 25px -10px rgba(2,6,23,.15)' },
      borderRadius: { xl: '14px', '2xl': '18px' }
    }
  },
  plugins: []
}