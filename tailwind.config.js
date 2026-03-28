/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./*.tsx", "./components.tsx"],
  theme: {
    extend: {
      colors: {
        f: {
          bg: "#0F0F12",
          surface: "#18181F",
          hover: "#1F1F28",
          border: "#2A2A35",
          text: "#E8E8ED",
          muted: "#8888A0",
          accent: "#6C5CE7",
          "accent-lt": "#a29bfe",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
