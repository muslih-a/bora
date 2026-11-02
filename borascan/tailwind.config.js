/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#7B1E2E',
          'maroon-dark': '#5A121F',
          blue: '#0072B2',
          'sky-blue': '#56B4E9',
          orange: '#E69F00',
          vermillion: '#D55E00',
          bg: '#FBF8F1',
          text: '#1D1D1B',
        },
        okabe: {
          blue: '#0072B2',
          orange: '#E69F00',
          vermillion: '#D55E00',
          black: '#1D1D1B',
          sky: '#56B4E9',
          yellow: '#F0E442',
          green: '#009E73',
        }
      },
    },
  },
  plugins: [],
}
