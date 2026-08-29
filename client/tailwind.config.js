/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ig: {
          primary: "#0095F6",
          "primary-hover": "#1877F2",
          badge: "#FF3040",
          like: "#ED4956",
          link: "#00376B",
          bg: "#FAFAFA",
          surface: "#FFFFFF",
          border: "#DBDBDB",
          "border-light": "#EFEFEF",
          "text-primary": "#262626",
          "text-secondary": "#737373",
          "text-muted": "#8E8E8E",
          "btn-secondary": "#EFEFEF",
          "btn-secondary-hover": "#DBDBDB",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: ['"Lobster Two"', '"Grand Hotel"', "cursive"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.05)",
        modal: "0 4px 12px rgba(0, 0, 0, 0.15)",
        dropdown: "0 4px 16px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "heart-beat": "heartBeat 0.8s ease-in-out",
      },
      keyframes: {
        heartBeat: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
