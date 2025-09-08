/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lab-blue': '#1e293b',
        'lab-light': '#334155',
        'lab-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
