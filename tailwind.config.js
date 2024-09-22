/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "sans-serif"]
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["valentine", "dark", "coffee"]
  }
}

