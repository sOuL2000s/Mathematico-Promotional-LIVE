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
        // New color palette
        'dark-background': '#1A1C25', // Deep Midnight Navy - Main page background
        'medium-dark': '#2A2C35',     // Slightly lighter dark for card backgrounds
        'primary': '#3D5A9E',         // Professional Royal Blue - Main brand color, buttons, highlights
        'secondary': '#C0C2CE',       // Soft Steel Silver - Secondary elements, borders, subtle text
        'accent': '#4CC9F0',          // Bright Electric Cyan - Accent highlights, interactive elements
        'light-text': '#E5E7EB',      // Off-White / Pearl - Main text on dark backgrounds
        'gray-text': '#8C8F9A',       // Mid-tone gray for less prominent text/placeholders
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-in forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-100%)' },
        },
        slideUpAndFade: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownAndFade: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}