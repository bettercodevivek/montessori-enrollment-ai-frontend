/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Classy blue
          600: '#2563eb',  // Main blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7cfc7',
          300: '#a3b0a3',
          400: '#7a8d7a',
          500: '#5f735f',  // Sage green
          600: '#4a5d4a',
          700: '#3d4d3d',
        },
        warm: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd9a5',
          300: '#f8c06d',
          400: '#f5a332',  // Warm amber
          500: '#f28b0c',
        },
        surface: {
          light: '#f8f9fa',
          DEFAULT: '#f5f7fa',
          dark: '#e8ecf1',
        },
      },
    },
  },
  plugins: [],
}

