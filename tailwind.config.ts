import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 29LT Adir font registered in globals.css via @font-face / next/font
        adir: ["var(--font-adir)", "system-ui", "sans-serif"],
        sans: ["var(--font-adir)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef7ee",
          100: "#d6ecd6",
          200: "#aedaae",
          300: "#7fc480",
          400: "#52ab55",
          500: "#33903a",
          600: "#26732d",
          700: "#1f5b26",
          800: "#1c4922",
          900: "#183d1e",
          950: "#0a210e",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
