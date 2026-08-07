/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          900: '#0A1926',
          800: '#0B1A28',
          700: '#112233',
        },
        'mint': {
          DEFAULT: '#5EEAD4',
          hover: '#2DD4BF',
        },
        'emergency': '#F0524B',
        'urgent': '#F5A83C',
        'routine': '#34D399',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
