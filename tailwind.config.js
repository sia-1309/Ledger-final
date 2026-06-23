/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#7E102C', 50: '#fdf2f4', 100: '#fce7ea', 200: '#f7cdd5', 300: '#f0a3b3', 400: '#e6748e', 500: '#d64365', 600: '#b9244b', 700: '#7E102C', 800: '#6b142b', 900: '#5c1529' },
        bg: { DEFAULT: '#E1D4C1', alt: '#E1D3CC' },
        surface: { DEFAULT: '#FFFFFF', muted: '#E1D3CC', hover: '#f5f0eb' },
        accent: { DEFAULT: '#D7A9A8', light: '#f0e0df', dark: '#c4918f' },
        text: { DEFAULT: '#58423F', muted: '#8a7370', light: '#a69491' },
        success: '#2d6a4f',
        warning: '#b8860b',
        error: '#9b2226',
        neutral: '#8a7370',
      },
    },
  },
  plugins: [],
}
