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
        ivory: "#FAF8F5",
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F0EDE8",
        },
        primary: {
          DEFAULT: "#292724",
          text: "#292724",
        },
        secondary: {
          DEFAULT: "#716B64",
          text: "#716B64",
        },
        burgundy: {
          DEFAULT: "#8F3945",
          pressed: "#702C36",
          deep: "#702C36",
          subtle: "#FAF1F2",
        },
        gold: {
          DEFAULT: "#C6A66B",
          subtle: "#F9F5EC",
        },
        border: {
          DEFAULT: "#E7E1D9",
          subtle: "#E7E1D9",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "9px",
        xl: "12px",
        full: "9999px",
      },
      spacing: {
        xs: "6px",
        sm: "20px",
        md: "30px",
        lg: "60px",
        xl: "96px",
      },
      fontSize: {
        "headline-display": ["72px", { lineHeight: "86px", letterSpacing: "-1.408px", fontWeight: "510" }],
        "headline-lg": ["49px", { lineHeight: "72px", letterSpacing: "-1.584px", fontWeight: "510" }],
        "headline-md": ["33px", { lineHeight: "40px", letterSpacing: "-0.24px", fontWeight: "510" }],
        "headline-sm": ["22px", { lineHeight: "28px", letterSpacing: "0px", fontWeight: "510" }],
        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "-0.165px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "24px", letterSpacing: "-0.165px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", letterSpacing: "-0.12px", fontWeight: "400" }],
        "label-lg": ["16px", { lineHeight: "24px", letterSpacing: "-0.12px", fontWeight: "510" }],
        "label-md": ["15px", { lineHeight: "20px", letterSpacing: "-0.12px", fontWeight: "510" }],
        "label-sm": ["13px", { lineHeight: "16px", letterSpacing: "0px", fontWeight: "510" }],
        "nav-sm": ["14px", { lineHeight: "20px", letterSpacing: "-0.08px", fontWeight: "400" }],
        "code-sm": ["13px", { lineHeight: "18px", letterSpacing: "0px", fontWeight: "400" }],
      },
      fontWeight: {
        "510": "510",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
