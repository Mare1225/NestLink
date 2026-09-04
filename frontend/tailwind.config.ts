import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        nest: {
          bg: "#070a10",
          panel: "#111820",
          border: "rgba(255,255,255,0.07)",
          text: "#eef2f7",
          muted: "#8b9aad",
          accent: "#5eb3ff",
          warm: "#e8a54b",
          green: "#34d399",
        },
      },
      boxShadow: {
        "nest-panel":
          "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset",
        "nest-glow": "0 0 40px rgba(94,179,255,0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
