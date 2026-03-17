/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./constants.tsx",
    "./types.ts",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          dark: '#0f0f0f',
          card: '#161616',
          border: '#2f3336',
          muted: '#71767b',
          primary: '#1d9bf0',
          youtube: '#ff0000',
          proph: '#00ba7c',
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        condensed: ["Roboto Condensed", "sans-serif"],
      },
    },
  },
  plugins: [],
}
