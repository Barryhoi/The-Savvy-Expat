import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        ink: "#041630",
        primary: "#4934FB",
        "primary-soft": "#7A5CFF",
        "on-primary": "#FFFFFF",
        line: "#E3E3E3",
        lavender: "#F4F2FF",
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        serif: ["Satoshi", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(73, 52, 251, 0.45)",
        "glow-lg": "0 25px 80px -20px rgba(73, 52, 251, 0.5)",
        card: "0 1px 2px rgba(4, 22, 48, 0.04), 0 8px 24px -12px rgba(4, 22, 48, 0.12)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
