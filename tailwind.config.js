/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EC",
        surface: "#FFFFFF",
        ink: "#1C1A17",
        muted: "#6B6256",
        line: "#E7DECF",
        brand: {
          DEFAULT: "#A8322A",
          dark: "#7E251F",
          tint: "#F6E6E2",
        },
        get: "#1F7A4D",
        getTint: "#E6F2EB",
        give: "#C0392B",
        giveTint: "#FBE9E7",
        brass: "#B07D2B",
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,26,23,0.04), 0 6px 18px rgba(28,26,23,0.05)",
        pop: "0 12px 40px rgba(28,26,23,0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
