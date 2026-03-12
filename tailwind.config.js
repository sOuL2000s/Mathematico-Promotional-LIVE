/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        primary: '#4CAF50', // A nice green
        secondary: '#2196F3', // A nice blue
        accent: '#FFC107', // A nice yellow/amber
        dark: '#263238', // Dark slate
        light: '#ECEFF1', // Light grey
      },
    },
  },
  plugins: [],
}