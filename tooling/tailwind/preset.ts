import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",

        gray: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },

        accent: {
          1: "#0A1F0A",
          2: "#0D2B0D",
          3: "#113811",
          4: "#164416",
          5: "#1C521C",
          6: "#246024",
          7: "#2F7A2F",
          8: "#39FF14",
          9: "#4DFF33",
          10: "#66FF52",
          11: "#39FF14",
          12: "#AAFFAA",
          DEFAULT: "#39FF14",
        },

        error: {
          DEFAULT: "#FF3333",
          light: "#FF6666",
          dark: "#CC0000",
        },
        warning: {
          DEFAULT: "#FFB800",
          light: "#FFCC44",
          dark: "#CC9200",
        },
        info: {
          DEFAULT: "#3399FF",
          light: "#66B3FF",
          dark: "#0066CC",
        },
      },

      fontFamily: {
        sans: ["Geist", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
        serif: ["Newsreader", "Georgia", "serif"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "display-sm": [
          "3.5rem",
          { lineHeight: "1", letterSpacing: "-0.02em" },
        ],
        display: ["5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-lg": [
          "7rem",
          { lineHeight: "0.95", letterSpacing: "-0.03em" },
        ],
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      maxWidth: {
        content: "72rem",
        wide: "90rem",
        ultrawide: "120rem",
      },

      screens: {
        "3xl": "1920px",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-up": "fadeUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        pulse: "pulse 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
} satisfies Partial<Config>;
