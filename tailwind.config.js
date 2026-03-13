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
        // Updated for a sleeker, more modern aesthetic
        primary: '#10B981', // Tailwind's emerald-500 for a fresh green
        secondary: '#3B82F6', // Tailwind's blue-500 for a vibrant blue
        accent: '#F59E0B', // Tailwind's amber-500 for a warm accent
        dark: '#1F2937', // Tailwind's gray-800 for deep text and backgrounds
        light: '#F9FAFB', // Tailwind's gray-50 for subtle light backgrounds
        'gray-base': '#6B7280', // Tailwind's gray-500 for general text
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
      },
    },
  },
  plugins: [],
}