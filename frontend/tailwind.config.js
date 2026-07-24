/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        hysacam: {
          red: "#C1272D",
          redDark: "#8F1B20",
          green: "#1E7B34",
          greenLight: "#E3F3E6",
          amber: "#B8791A",
          amberLight: "#FBF0DF",
          ink: "#1C1C1C",
          paper: "#FAFAF9",
          line: "#E4E1DC",
        },
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
