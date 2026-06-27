import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        beige: {
          50:  "#faf8f5",
          100: "#f4f0e8",
          200: "#e8dfd0",
        },
        sage: {
          50:  "#f2f7f2",
          100: "#e8f0e8",
          200: "#c8dcc8",
          300: "#a0c0a0",
          400: "#78a478",
          500: "#5a8a5a",
          600: "#4a7a4a",
          700: "#3a6a3a",
          800: "#2a5a2a",
        },
        warm: {
          50:  "#fffbf0",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        sky: {
          50:  "#f0f7ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
        },
        rose: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          500: "#f43f5e",
          600: "#e11d48",
        },
        slate: {
          warm: "#8a9aaa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: ["1.0625rem", "1.6"],
        lg:   ["1.125rem",  "1.6"],
        xl:   ["1.25rem",   "1.5"],
        "2xl":["1.5rem",    "1.4"],
        "3xl":["1.875rem",  "1.3"],
      },
    },
  },
  plugins: [],
};
export default config;
