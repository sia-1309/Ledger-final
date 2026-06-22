/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0066ff', 50: '#e6f0ff', 100: '#b3d4ff', 200: '#80b8ff', 300: '#4d9cff', 400: '#1a80ff', 500: '#0066ff', 600: '#0052cc', 700: '#003d99', 800: '#002966', 900: '#001433' },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        neutral: '#6b7280',
      },
    },
  },
  plugins: [],
}
