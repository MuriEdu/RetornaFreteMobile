/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: "#EA812E",
        white: "#F9F9F9",
        black: "#1A1A1A",
        gray: "#666666"
      }
    },
  },
  plugins: [],
}