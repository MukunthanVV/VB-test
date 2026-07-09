/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "on-surface": "var(--color-on-surface)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "background": "var(--color-background)",
        "surface": "var(--color-surface)",
        "surface-variant": "var(--color-surface-variant)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-high": "var(--color-surface-container-high)",
        "outline": "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
        "primary": "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "secondary": "var(--color-secondary)",
        "on-secondary": "var(--color-on-secondary)",
        "tertiary": "var(--color-tertiary)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "gold": "var(--color-gold)"
      },
      fontFamily: {
        "label-caps": ["JetBrains Mono", "monospace"],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Anton", "sans-serif"],
        "display-xl-mobile": ["Anton", "sans-serif"],
        "label-ui": ["Hanken Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Anton", "sans-serif"],
        "headline-lg": ["Anton", "sans-serif"],
        "display-xl": ["Anton", "sans-serif"]
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.15em", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "body-lg": ["20px", { lineHeight: "32px", fontWeight: "400" }],
        "headline-md": ["48px", { lineHeight: "52px", letterSpacing: "0.03em", fontWeight: "400" }],
        "display-xl-mobile": ["48px", { lineHeight: "48px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "label-ui": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "headline-lg-mobile": ["40px", { lineHeight: "44px", letterSpacing: "0.02em", fontWeight: "400" }],
        "headline-lg": ["72px", { lineHeight: "76px", letterSpacing: "0.02em", fontWeight: "400" }],
        "display-xl": ["120px", { lineHeight: "110px", letterSpacing: "-0.02em", fontWeight: "400" }]
      },
      spacing: {
        "container-max": "1440px",
        "margin-desktop": "80px",
        "gutter": "32px",
        "unit": "8px",
        "margin-mobile": "24px",
        "section-gap": "160px"
      },
      borderRadius: {
        "DEFAULT": "4px",
        "lg": "8px",
        "xl": "12px",
        "full": "9999px"
      }
    },
  },
  plugins: [],
}
