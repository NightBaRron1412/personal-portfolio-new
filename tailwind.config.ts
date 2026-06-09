import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./@/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        bg: {
          main: "var(--bg-main)",
          secondary: "var(--bg-secondary)",
          elevated: "var(--bg-elevated)",
          surface: "var(--surface)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          faint: "var(--text-faint)",
          "on-accent": "var(--text-on-accent)"
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          blue: "var(--accent-blue)",
          purple: "var(--accent-purple)",
          pink: "var(--accent-pink)",
          soft: "var(--accent-soft)",
          glow: "var(--accent-glow)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px var(--accent-soft), 0 12px 40px -16px var(--accent-glow)",
        soft: "0 20px 60px -30px rgba(0,0,0,0.6)",
        card: "var(--card-shadow)"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" }
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        marquee: "marquee var(--duration, 40s) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration, 40s) linear infinite"
      }
    }
  },
  plugins: [animatePlugin]
};

export default config;
