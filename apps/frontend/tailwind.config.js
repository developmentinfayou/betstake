/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0DB7',
        secondary: '#FFC100',
        special: '#73FFD7',
        alt: '#9D73FF',
        'gradient-main-from': '#C20DFF',
        'gradient-main-to': '#00C3FF',
        'gradient-alt-from': '#FF0D11',
        'gradient-alt-to': '#FF6A00',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to right, #C20DFF, #00C3FF)',
        'gradient-alt': 'linear-gradient(to right, #FF0D11, #FF6A00)',
      },
    },
  },
  plugins: [],
}
