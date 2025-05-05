/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#a64143',
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms')],
}

