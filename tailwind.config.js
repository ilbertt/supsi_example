/** @type {import('tailwindcss').Config} */
export default {
  content: ["**/*.{html,js,ts}"],
  daisyui: {
    themes: ["night"],
  },
  plugins: [require("daisyui")],
}

