import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F6F2",
        foreground: "#171717",
        secondary: "#77736C",
        surface: "#FFFFFF",
        "surface-soft": "#EFECE6",
        "surface-card": "#FFFFFF",
        border: "#E8E5DF",
        "border-strong": "#D5D1C8",
        brand: {
          DEFAULT: "#171717",
          hover: "#2A2A2A",
          accent: "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Manrope", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        card: "0 4px 12px rgba(0,0,0,0.03)",
        elevated: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03)",
      },
    },
  },
  plugins: [],
};

export default config;

