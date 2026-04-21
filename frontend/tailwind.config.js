/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        docblue: '#1265A8',
        docgreen: '#84C225',
        docorange: '#FF8200'
      },
    },
  },
  plugins: [],
}
