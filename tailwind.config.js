/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0d0d14',
        surface: '#1a1a2e',
        'surface-2': '#16213e',
        accent: '#7c3aed',
        'accent-2': '#2563eb',
      },
    },
  },
  plugins: [],
}

