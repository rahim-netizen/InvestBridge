/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f6f8fa",
          100: "#eceff3",
          200: "#d5dde6",
          300: "#b0bfce",
          400: "#7d93aa",
          500: "#586f87",
          600: "#42566b",
          700: "#364658",
          800: "#2f3a48",
          900: "#1a2230",
          950: "#0f1620",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,22,32,0.04), 0 8px 24px rgba(15,22,32,0.06)",
        lift: "0 4px 8px rgba(15,22,32,0.04), 0 24px 48px rgba(15,22,32,0.10)",
        glow: "0 0 0 1px rgba(16,185,129,0.15), 0 12px 40px rgba(16,185,129,0.18)",
      },
      keyframes: {
        floatUp: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatUp: "floatUp 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
