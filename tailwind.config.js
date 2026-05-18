/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'healing-base': '#F9FAFB',
        'healing-purple': '#8B5CF6',
        'healing-blue': '#60A5FA',
        'healing-green': '#10B981',
        'kids-purple': '#A855F7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        kids: ['Quicksand', 'Comic Sans MS', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}