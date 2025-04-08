/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      keyframes: { fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } } },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
    },
  },
};
